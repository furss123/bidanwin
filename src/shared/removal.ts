/** Log line streamed from the removal engine to the renderer. */
export type RemovalLogType = 'info' | 'success' | 'error' | 'blocked' | 'warn'

export interface RemovalLogLine {
  type: RemovalLogType
  appId: string
  message: string
  timestamp: number
}

/** Summary emitted when a removal batch finishes. */
export interface RemovalResult {
  appIds: string[]
  succeeded: string[]
  failed: string[]
  blocked: string[]
}

export function createRemovalLogLine(
  type: RemovalLogType,
  appId: string,
  message: string
): RemovalLogLine {
  return { type, appId, message, timestamp: Date.now() }
}
