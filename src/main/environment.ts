// Windows admin detection, OS/tooling probes, and UAC elevation relaunch
import { execSync, spawnSync } from 'child_process'
import { app } from 'electron'
import os from 'os'
import type { EnvInfo } from '../shared/env'

const PS_ADMIN_CHECK =
  '[bool]([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)'

/**
 * Elevation detection via .NET WindowsPrincipal (primary) or `net session` (fallback).
 * WindowsPrincipal is the canonical API; net session succeeds only for elevated tokens.
 */
export function isElevated(): boolean {
  if (process.platform !== 'win32') return false

  try {
    const result = execSync(`powershell.exe -NoProfile -Command "${PS_ADMIN_CHECK}"`, {
      encoding: 'utf8',
      timeout: 8000,
      windowsHide: true
    }).trim()
    if (result === 'True') return true
    if (result === 'False') return false
  } catch {
    // PowerShell unavailable — try net session fallback below
  }

  try {
    execSync('net session', { stdio: 'ignore', timeout: 5000, windowsHide: true })
    return true
  } catch {
    return false
  }
}

function commandResponds(command: string, args: string[]): boolean {
  try {
    const result = spawnSync(command, args, {
      encoding: 'utf8',
      timeout: 8000,
      windowsHide: true
    })
    return result.status === 0
  } catch {
    return false
  }
}

function getWindowsVersionLabel(): string {
  try {
    const script = [
      '$os = Get-CimInstance Win32_OperatingSystem',
      '$ver = (Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion").DisplayVersion',
      'Write-Output ($os.Caption + " " + $ver)'
    ].join('; ')
    const label = execSync(`powershell.exe -NoProfile -Command "${script}"`, {
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true
    }).trim()
    if (label) return label
  } catch {
    // fall through to os.release()
  }
  return `Windows (build ${os.release()})`
}

/** Collect environment info; safe on non-Windows (returns defaults, never throws). */
export function getEnvironment(): EnvInfo {
  const isWindows = process.platform === 'win32'

  if (!isWindows) {
    return {
      isAdmin: false,
      windowsVersion: `${os.type()} ${os.release()}`,
      isWindows: false,
      powershellAvailable: false,
      wingetAvailable: false
    }
  }

  const powershellAvailable = commandResponds('powershell.exe', [
    '-NoProfile',
    '-Command',
    'exit 0'
  ])

  const wingetAvailable = commandResponds('winget.exe', ['--version'])

  return {
    isAdmin: isElevated(),
    windowsVersion: getWindowsVersionLabel(),
    isWindows: true,
    powershellAvailable,
    wingetAvailable
  }
}

export interface RelaunchResult {
  success: boolean
  cancelled?: boolean
  error?: string
}

/**
 * Relaunch with UAC elevation via ProcessStartInfo.Verb = "runas".
 * Win32 error 1223 = user cancelled UAC — current instance keeps running.
 * On success a new elevated process starts and this instance quits.
 */
export function relaunchElevated(): RelaunchResult {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Elevation is only supported on Windows' }
  }

  const exe = process.execPath.replace(/'/g, "''")

  const argString = process.argv
    .slice(1)
    .map((a) => `"${a.replace(/"/g, '\\"')}"`)
    .join(' ')

  const script = [
    '$psi = New-Object System.Diagnostics.ProcessStartInfo',
    `$psi.FileName = '${exe}'`,
    `$psi.Arguments = '${argString.replace(/'/g, "''")}'`,
    "$psi.Verb = 'runas'",
    '$psi.UseShellExecute = $true',
    'try {',
    '  [void][System.Diagnostics.Process]::Start($psi)',
    '  exit 0',
    '} catch [System.ComponentModel.Win32Exception] {',
    '  if ($_.NativeErrorCode -eq 1223) { exit 1223 }',
    '  exit 1',
    '} catch {',
    '  exit 1',
    '}'
  ].join('; ')

  try {
    const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', script], {
      encoding: 'utf8',
      timeout: 120000,
      windowsHide: true
    })

    if (result.status === 0) {
      // Elevated child is launching — exit the non-elevated instance
      app.quit()
      return { success: true }
    }

    if (result.status === 1223) {
      return { success: false, cancelled: true }
    }

    return {
      success: false,
      error: result.stderr?.trim() || `Elevation failed (exit ${result.status})`
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Elevation failed'
    }
  }
}
