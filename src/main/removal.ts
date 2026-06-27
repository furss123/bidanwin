// Removal engine — Appx two-step uninstall, winget fallback, OneDrive special case
import { CATALOG, isBlocked } from '../shared/catalog'
import { createRemovalLogLine, type RemovalLogLine, type RemovalResult } from '../shared/removal'
import type { BloatApp } from '../shared/types'
import { isElevated } from './environment'
import { getPowerShellCommand, spawnWithStreaming } from './psUtils'

type EmitFn = (line: RemovalLogLine) => void
type AppOutcome = 'success' | 'failed' | 'blocked'

interface RemovalContext {
  appId: string
  dryRun: boolean
  emit: EmitFn
}

/** HRESULT / message fragments indicating Windows blocked uninstall (e.g. Phone Link). */
const BLOCKED_ERROR_MARKERS = [
  '0x80073d23',
  '0x80070005',
  '0x80004005',
  'blocked',
  'prohibited',
  'not allowed',
  'access is denied',
  'access denied',
  'denied by policy'
]

function isProtectedUninstallError(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_ERROR_MARKERS.some((m) => lower.includes(m))
}

function runPowerShell(script: string, ctx: RemovalContext, label: string): Promise<number> {
  const { exe, baseArgs } = getPowerShellCommand()
  const emitLine = (line: string, stream: 'stdout' | 'stderr'): void => {
    ctx.emit(createRemovalLogLine('info', ctx.appId, `[${stream}] ${line}`))
  }

  if (ctx.dryRun) {
    ctx.emit(createRemovalLogLine('info', ctx.appId, `[dry-run] ${label}`))
    return Promise.resolve(0)
  }

  return spawnWithStreaming(exe, [...baseArgs, script], emitLine).then((r) => r.exitCode)
}

async function runWingetUninstall(app: BloatApp, ctx: RemovalContext): Promise<number> {
  const wingetId = app.wingetId!
  const label = `winget uninstall --id "${wingetId}" --silent --accept-source-agreements`

  if (ctx.dryRun) {
    ctx.emit(createRemovalLogLine('info', ctx.appId, `[dry-run] ${label}`))
    return 0
  }

  const emitLine = (line: string, stream: 'stdout' | 'stderr'): void => {
    ctx.emit(createRemovalLogLine('info', ctx.appId, `[${stream}] ${line}`))
  }

  const { exitCode } = await spawnWithStreaming(
    'winget.exe',
    ['uninstall', '--id', wingetId, '--silent', '--accept-source-agreements'],
    emitLine
  )
  return exitCode
}

/**
 * Step 1 — remove installed packages for all users.
 * Get-AppxPackage finds per-user + all-users copies; Remove-AppxPackage -AllUsers
 * removes the package from every profile on the machine.
 */
function buildAppxInstalledScript(pattern: string): string {
  const p = pattern.replace(/'/g, "''")
  return [
    `$pattern = '${p}'`,
    '$pkgs = Get-AppxPackage -AllUsers | Where-Object { $_.Name -like $pattern }',
    'if ($pkgs) {',
    '  $pkgs | Remove-AppxPackage -AllUsers',
    '  Write-Output "Removed installed package(s) matching $pattern"',
    '} else {',
    '  Write-Output "No installed package found for $pattern"',
    '}'
  ].join('; ')
}

/**
 * Step 2 — remove provisioned (staged) package from the OS image.
 * Provisioned packages are reinstalled for every new user account unless removed
 * with Remove-AppxProvisionedPackage -Online — both steps are required for a
 * clean debloat that survives new local accounts.
 */
function buildAppxProvisionedScript(pattern: string): string {
  const p = pattern.replace(/'/g, "''")
  return [
    `$pattern = '${p}'`,
    '$prov = Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like $pattern }',
    'if ($prov) {',
    '  $prov | Remove-AppxProvisionedPackage -Online',
    '  Write-Output "Removed provisioned package(s) matching $pattern"',
    '} else {',
    '  Write-Output "No provisioned package found for $pattern"',
    '}'
  ].join('; ')
}

async function runAppxPattern(
  pattern: string,
  ctx: RemovalContext
): Promise<{ installedRemoved: boolean; hadError: boolean; output: string }> {
  if (isBlocked(pattern)) {
    ctx.emit(
      createRemovalLogLine('blocked', ctx.appId, `Pattern blocked by policy: ${pattern}`)
    )
    return { installedRemoved: false, hadError: false, output: 'blocked' }
  }

  const lines: string[] = []
  const captureEmit: EmitFn = (line) => {
    lines.push(line.message)
    ctx.emit(line)
  }
  const subCtx: RemovalContext = { ...ctx, emit: captureEmit }

  const exit1 = await runPowerShell(
    buildAppxInstalledScript(pattern),
    subCtx,
    `Appx installed: Get-AppxPackage -AllUsers | Remove for "${pattern}"`
  )

  const exit2 = await runPowerShell(
    buildAppxProvisionedScript(pattern),
    subCtx,
    `Appx provisioned: Get-AppxProvisionedPackage -Online | Remove for "${pattern}"`
  )

  const output = lines.join('\n')
  const installedRemoved = /Removed installed package/i.test(output)
  const hadError = exit1 !== 0 || exit2 !== 0

  if (hadError) {
    ctx.emit(
      createRemovalLogLine(
        'warn',
        ctx.appId,
        `Appx step exited non-zero for ${pattern} (installed=${exit1}, provisioned=${exit2})`
      )
    )
  }

  return { installedRemoved, hadError, output }
}

async function removeOneDrive(app: BloatApp, ctx: RemovalContext): Promise<AppOutcome> {
  const script = [
    'Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue',
    '$setup = Join-Path $env:SystemRoot "SysWOW64\\OneDriveSetup.exe"',
    'if (!(Test-Path $setup)) { $setup = Join-Path $env:SystemRoot "System32\\OneDriveSetup.exe" }',
    'if (!(Test-Path $setup)) { Write-Error "OneDriveSetup.exe not found"; exit 1 }',
    'Write-Output "Running: $setup /uninstall"',
    'Start-Process -FilePath $setup -ArgumentList "/uninstall" -Wait',
    'Write-Output "OneDrive uninstall finished"'
  ].join('; ')

  const exit = await runPowerShell(
    script,
    ctx,
    'OneDrive: Stop-Process OneDrive; OneDriveSetup.exe /uninstall'
  )
  return exit === 0 ? 'success' : 'failed'
}

async function removeViaAppx(app: BloatApp, ctx: RemovalContext): Promise<AppOutcome> {
  let anyInstalled = false
  let anyError = false
  let combinedOutput = ''

  for (const pattern of app.packagePatterns) {
    const result = await runAppxPattern(pattern, ctx)
    if (result.installedRemoved) anyInstalled = true
    if (result.hadError) anyError = true
    combinedOutput += result.output + '\n'

    if (app.id === 'phone-link' && result.hadError && isProtectedUninstallError(result.output)) {
      ctx.emit(
        createRemovalLogLine(
          'blocked',
          ctx.appId,
          'Phone Link removal blocked by Windows (protected package)'
        )
      )
      return 'blocked'
    }
  }

  if (app.id === 'phone-link' && anyError && isProtectedUninstallError(combinedOutput)) {
    ctx.emit(
      createRemovalLogLine(
        'blocked',
        ctx.appId,
        'Phone Link removal blocked by Windows (protected package)'
      )
    )
    return 'blocked'
  }

  if (app.wingetId && (!anyInstalled || anyError)) {
    ctx.emit(
      createRemovalLogLine(
        'info',
        ctx.appId,
        `${anyInstalled ? 'Appx had errors' : 'No Appx match'} — trying winget fallback (${app.wingetId})`
      )
    )
    const wingetExit = await runWingetUninstall(app, ctx)
    if (wingetExit !== 0) {
      ctx.emit(createRemovalLogLine('error', ctx.appId, `winget uninstall failed (exit ${wingetExit})`))
      return 'failed'
    }
    return 'success'
  }

  if (anyError && !anyInstalled) {
    return 'failed'
  }

  // No packages found is OK — already uninstalled
  return 'success'
}

async function removeSingleApp(app: BloatApp, dryRun: boolean, emit: EmitFn): Promise<AppOutcome> {
  const ctx: RemovalContext = { appId: app.id, dryRun, emit }

  emit(createRemovalLogLine('info', app.id, `Starting removal: ${app.name}`))

  try {
    if (app.id === 'onedrive') {
      return await removeOneDrive(app, ctx)
    }

    if (app.removalMethod === 'winget' && app.wingetId) {
      const exit = await runWingetUninstall(app, ctx)
      return exit === 0 ? 'success' : 'failed'
    }

    return await removeViaAppx(app, ctx)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    emit(createRemovalLogLine('error', app.id, `Unexpected error: ${message}`))
    return 'failed'
  }
}

/** Resolve catalog entries, skipping unknown ids and NEVER_REMOVE patterns. */
export function resolveRemovableApps(appIds: string[]): BloatApp[] {
  const apps: BloatApp[] = []

  for (const id of appIds) {
    const app = CATALOG.find((entry) => entry.id === id)
    if (!app) continue

    const blockedPattern = app.packagePatterns.find((pattern) => isBlocked(pattern))
    if (blockedPattern) continue

    apps.push(app)
  }

  return apps
}

export interface RunRemovalBatchOptions {
  dryRun?: boolean
  onLog: (line: RemovalLogLine) => void
}

/** Process apps sequentially; one failure does not stop the batch. */
export async function runRemovalBatch(
  appIds: string[],
  options: RunRemovalBatchOptions
): Promise<RemovalResult> {
  // Re-query elevation at runtime — do not trust the UI gate alone
  if (!options.dryRun && process.platform === 'win32' && !isElevated()) {
    throw new Error('Removal requires administrator privileges')
  }

  const apps = resolveRemovableApps(appIds)
  const succeeded: string[] = []
  const failed: string[] = []
  const blocked: string[] = []
  const processedIds = apps.map((a) => a.id)

  for (const app of apps) {
    const outcome = await removeSingleApp(app, options.dryRun ?? false, options.onLog)

    if (outcome === 'blocked') {
      blocked.push(app.id)
    } else if (outcome === 'failed') {
      failed.push(app.id)
      options.onLog(createRemovalLogLine('error', app.id, `Failed: ${app.name}`))
    } else {
      succeeded.push(app.id)
      options.onLog(createRemovalLogLine('success', app.id, `Completed: ${app.name}`))
    }
  }

  return { appIds: processedIds, succeeded, failed, blocked }
}

/** Console-only dry-run smoke test — no packages are modified. */
export async function runDryRunSmokeTest(sampleIds?: string[]): Promise<RemovalResult> {
  const ids =
    sampleIds ??
    ['solitaire', 'weather', 'onedrive', 'phone-link', 'terminal'].filter((id) =>
      CATALOG.some((a) => a.id === id)
    )

  console.log('\n========== BIDANWIN_TEST_REMOVAL dry-run ==========')
  console.log(`Sample app IDs: ${ids.join(', ')}\n`)

  const result = await runRemovalBatch(ids, {
    dryRun: true,
    onLog: (line) => {
      console.log(`[${line.type}] [${line.appId}] ${line.message}`)
    }
  })

  console.log('\nResult:', JSON.stringify(result, null, 2))
  console.log('========== dry-run complete (no packages were modified) ==========\n')

  return result
}
