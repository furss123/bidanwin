/**
 * OEM manufacturer detection and installed-app scanning.
 *
 * OemApp maps cleanly to BloatApp via oemAppToBloatApp() — the removal engine
 * routes by removalMethod ('winget' → runWingetUninstall, 'appx' → removeViaAppx)
 * with no OEM-specific changes required in removal.ts.
 */
import { runPowerShellScript, spawnWithStreaming } from './psUtils'
import {
  getOemAppsForManufacturer,
  mergeOemAppsIntoCatalog,
  type OemApp,
  type OemDetectionResult,
  type OemManufacturer
} from '../shared/oemCatalog'

const CHECK_TIMEOUT_MS = 5_000

let lastDetectionResult: OemDetectionResult | null = null

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export function normalizeManufacturer(raw: string): OemManufacturer {
  const lower = raw.toLowerCase()

  if (lower.includes('samsung')) return 'samsung'
  if (lower.includes('lg electronics') || (lower.includes('lg') && !lower.includes('logitech'))) {
    return 'lg'
  }
  if (lower.includes('hp') || lower.includes('hewlett')) return 'hp'
  if (lower.includes('dell')) return 'dell'
  if (lower.includes('lenovo')) return 'lenovo'
  if (lower.includes('asus') || lower.includes('asustek')) return 'asus'
  if (lower.includes('acer')) return 'acer'
  if (lower.includes('micro-star') || lower === 'msi') return 'msi'
  if (lower.includes('toshiba')) return 'toshiba'
  if (lower.includes('sony')) return 'sony'
  if (lower.includes('microsoft')) return 'microsoft'

  return 'unknown'
}

async function detectManufacturerWmi(): Promise<{
  manufacturer: OemManufacturer
  rawManufacturerString: string
  model: string
}> {
  if (process.platform !== 'win32') {
    return { manufacturer: 'unknown', rawManufacturerString: '', model: '' }
  }

  try {
    const script = [
      'Get-WmiObject -Class Win32_ComputerSystem |',
      'Select-Object -Property Manufacturer, Model |',
      'ConvertTo-Json'
    ].join(' ')

    const { exitCode, output } = await runPowerShellScript(script)
    if (exitCode !== 0 || !output.trim()) {
      throw new Error('WMI query failed')
    }

    const parsed = JSON.parse(output) as { Manufacturer?: string; Model?: string }
    const rawManufacturerString = String(parsed.Manufacturer ?? '').trim()
    const model = String(parsed.Model ?? '').trim()

    return {
      manufacturer: normalizeManufacturer(rawManufacturerString),
      rawManufacturerString,
      model
    }
  } catch (err) {
    console.warn('[oemDetector] WMI manufacturer detection failed:', err)
    return { manufacturer: 'unknown', rawManufacturerString: '', model: '' }
  }
}

async function checkWingetInstalled(wingetId: string): Promise<boolean> {
  try {
    const { exitCode, output } = await withTimeout(
      spawnWithStreaming(
        'winget.exe',
        ['list', '--id', wingetId, '--exact', '--accept-source-agreements'],
        undefined
      ),
      CHECK_TIMEOUT_MS
    )
    return exitCode === 0 && output.toLowerCase().includes(wingetId.toLowerCase())
  } catch {
    return false
  }
}

async function checkAppxInstalled(pattern: string): Promise<boolean> {
  const escaped = pattern.replace(/'/g, "''")
  const script = [
    `$pkgs = Get-AppxPackage -AllUsers | Where-Object { $_.Name -like '${escaped}' }`,
    "if ($pkgs) { Write-Output 'installed' }"
  ].join('; ')

  try {
    const { exitCode, output } = await withTimeout(runPowerShellScript(script), CHECK_TIMEOUT_MS)
    return exitCode === 0 && output.toLowerCase().includes('installed')
  } catch {
    return false
  }
}

async function isOemAppInstalled(app: OemApp, wingetAvailable: boolean): Promise<boolean> {
  if (app.removalMethod === 'winget') {
    if (!wingetAvailable || !app.wingetId) return false
    return checkWingetInstalled(app.wingetId)
  }

  if (app.removalMethod === 'appx' && app.packagePatterns?.length) {
    const results = await Promise.all(app.packagePatterns.map((pattern) => checkAppxInstalled(pattern)))
    return results.some(Boolean)
  }

  return false
}

export function getOemDetectionResult(): OemDetectionResult | null {
  return lastDetectionResult
}

export async function detectOemApps(wingetAvailable: boolean): Promise<OemDetectionResult> {
  const { manufacturer, rawManufacturerString, model } = await detectManufacturerWmi()
  const candidates = getOemAppsForManufacturer(manufacturer)

  let wingetScanSkipped = false
  const hasWingetCandidates = candidates.some(
    (app) => app.removalMethod === 'winget' && Boolean(app.wingetId)
  )

  if (!wingetAvailable && hasWingetCandidates) {
    wingetScanSkipped = true
    console.warn('[oemDetector] winget not available — OEM winget app scan skipped')
  }

  const checks = candidates.map(async (app) => {
    const installed = await isOemAppInstalled(app, wingetAvailable)
    return installed ? app : null
  })

  const results = await Promise.all(checks)
  const installedOemApps = results.filter((app): app is OemApp => app !== null)

  const detection: OemDetectionResult = {
    manufacturer,
    rawManufacturerString,
    model,
    installedOemApps,
    wingetScanSkipped
  }

  if (installedOemApps.length > 0) {
    mergeOemAppsIntoCatalog(installedOemApps)
  }

  lastDetectionResult = detection
  return detection
}
