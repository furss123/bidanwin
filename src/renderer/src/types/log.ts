export type LogLevel = 'info' | 'success' | 'error' | 'blocked' | 'warn'

export interface LogLine {
  id: string
  type: LogLevel
  message: string
}

export function createLogLine(type: LogLevel, message: string): LogLine {
  return { id: crypto.randomUUID(), type, message }
}
