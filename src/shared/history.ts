import type { AppCategory, SafetyLevel } from './types'

export type RemovalStatus = 'succeeded' | 'failed' | 'blocked'

export interface RemovedAppRecord {
  appId: string
  appName: string
  category: AppCategory
  safety: SafetyLevel
  status: RemovalStatus
  errorMessage?: string
  timestamp: number
}

export interface RemovalSession {
  sessionId: string
  startedAt: number
  finishedAt: number
  locale: string
  windowsVersion: string
  appVersion: string
  apps: RemovedAppRecord[]
  summary: {
    total: number
    succeeded: number
    failed: number
    blocked: number
  }
}

export interface HistoryFile {
  version: '1'
  sessions: RemovalSession[]
}
