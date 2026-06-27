// Windows System Restore point creation before debloat
import type { RestorePointResult } from '../shared/restore'
import { runPowerShellScript } from './psUtils'

const RESTORE_POINT_THROTTLE_MARKERS = [
  '24 hours',
  '24 hour',
  'already been created',
  '0x8004230f',
  'srsnapshothardlimit',
  '2214'
]

function isRestorePointThrottled(output: string): boolean {
  const lower = output.toLowerCase()
  return RESTORE_POINT_THROTTLE_MARKERS.some((m) => lower.includes(m))
}

/**
 * Check whether System Protection / shadow copies are configured for C:.
 * Uses vssadmin — if no shadow storage is listed, restore points cannot be created.
 */
export async function canCreateRestorePoint(): Promise<boolean> {
  if (process.platform !== 'win32') return false

  const script = [
    '$out = (& vssadmin list shadowstorage 2>&1) | Out-String',
    "if ($out -match 'For volume' -and $out -notmatch 'No items found') { 'enabled' } else { 'disabled' }"
  ].join('; ')

  try {
    const { output } = await runPowerShellScript(script)
    return output.toLowerCase().includes('enabled')
  } catch {
    return false
  }
}

/**
 * Create a System Restore point via Checkpoint-Computer.
 * Requires admin. Throttled to ~1/day by Windows — treated as success with a warning.
 */
export async function createRestorePoint(
  onLine?: (line: string, stream: 'stdout' | 'stderr') => void
): Promise<RestorePointResult> {
  if (process.platform !== 'win32') {
    return { success: false, skipped: true, error: 'Not supported on non-Windows' }
  }

  const protectionEnabled = await canCreateRestorePoint()
  if (!protectionEnabled) {
    return {
      success: false,
      skipped: false,
      warning: 'System Protection appears disabled on C: — restore point could not be created'
    }
  }

  const script = [
    `$desc = "BidanWin — before debloat $(Get-Date -Format 'yyyy-MM-dd HH:mm')"`,
    'Checkpoint-Computer -Description $desc -RestorePointType MODIFY_SETTINGS'
  ].join('; ')

  try {
    const { exitCode, output } = await runPowerShellScript(script, onLine)
    const combined = output

    if (exitCode === 0) {
      return { success: true, skipped: false }
    }

    if (isRestorePointThrottled(combined)) {
      return {
        success: true,
        skipped: false,
        warning:
          'A restore point was created within the last 24 hours — skipping.'
      }
    }

    return {
      success: false,
      skipped: false,
      error: combined || `Checkpoint-Computer failed (exit ${exitCode})`
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (isRestorePointThrottled(message)) {
      return {
        success: true,
        skipped: false,
        warning:
          'A restore point was created within the last 24 hours — skipping.'
      }
    }
    return { success: false, skipped: false, error: message }
  }
}
