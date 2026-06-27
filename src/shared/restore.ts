/** Result of a System Restore point creation attempt. */
export interface RestorePointResult {
  success: boolean
  skipped: boolean
  error?: string
  warning?: string
}
