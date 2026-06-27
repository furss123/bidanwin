/** Environment snapshot returned by getEnvironment() IPC. */
export interface EnvInfo {
  isAdmin: boolean
  windowsVersion: string
  isWindows: boolean
  powershellAvailable: boolean
  wingetAvailable: boolean
}

/** Whether the app can perform removals (admin + Windows + PowerShell). */
export function canPerformRemoval(env: EnvInfo | null): boolean {
  if (!env) return false
  return env.isWindows && env.isAdmin && env.powershellAvailable
}

/** Human-readable reason removal buttons are disabled, or null if allowed. */
export function removalBlockReason(env: EnvInfo | null): string | null {
  if (!env) return 'Loading environment…'
  if (!env.isWindows) return 'Removal is not supported on this OS (preview mode)'
  if (!env.powershellAvailable) return 'PowerShell is required for removal'
  if (!env.isAdmin) return 'Administrator privileges required'
  return null
}
