import { randomUUID } from 'crypto'
import { app } from 'electron'
import { copyFile, readFile, rename, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { CATALOG } from '../shared/catalog'
import type { EnvInfo } from '../shared/env'
import type {
  HistoryFile,
  RemovalSession,
  RemovedAppRecord,
  RemovalStatus
} from '../shared/history'
import type { Locale } from '../shared/i18n'
import type { RemovalResult } from '../shared/removal'

const EMPTY_HISTORY: HistoryFile = { version: '1', sessions: [] }

export function getHistoryFilePath(): string {
  return join(app.getPath('userData'), 'history.json')
}

export async function loadHistory(): Promise<HistoryFile> {
  const path = getHistoryFilePath()
  if (!existsSync(path)) {
    return { version: '1', sessions: [] }
  }

  try {
    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw) as HistoryFile
    if (parsed?.version !== '1' || !Array.isArray(parsed.sessions)) {
      return { version: '1', sessions: [] }
    }
    return parsed
  } catch {
    return { version: '1', sessions: [] }
  }
}

export async function saveHistory(file: HistoryFile): Promise<void> {
  const dir = app.getPath('userData')
  const path = join(dir, 'history.json')
  const tmpPath = join(dir, 'history.tmp.json')
  const content = JSON.stringify(file, null, 2)
  await writeFile(tmpPath, content, 'utf-8')
  await rename(tmpPath, path)
}

export async function appendSession(session: RemovalSession): Promise<void> {
  const file = await loadHistory()
  file.sessions.push(session)
  await saveHistory(file)
}

export async function clearHistory(): Promise<void> {
  await saveHistory({ ...EMPTY_HISTORY })
}

export async function exportHistoryToFile(targetPath: string): Promise<void> {
  const path = getHistoryFilePath()
  if (!existsSync(path)) {
    await saveHistory({ ...EMPTY_HISTORY })
  }
  await copyFile(path, targetPath)
}

export function buildRemovalSession(
  result: RemovalResult,
  options: {
    startedAt: number
    locale: Locale
    env: EnvInfo
    errorMessages: Record<string, string>
    batchError?: string
  }
): RemovalSession {
  const finishedAt = Date.now()
  const apps: RemovedAppRecord[] = []

  for (const appId of result.appIds) {
    const entry = CATALOG.find((a) => a.id === appId)
    let status: RemovalStatus
    if (result.succeeded.includes(appId)) {
      status = 'succeeded'
    } else if (result.blocked.includes(appId)) {
      status = 'blocked'
    } else {
      status = 'failed'
    }

    const record: RemovedAppRecord = {
      appId,
      appName: entry?.name ?? appId,
      category: entry?.category ?? 'apps',
      safety: entry?.safety ?? 'safe',
      status,
      timestamp: finishedAt
    }

    if (status === 'failed') {
      record.errorMessage =
        options.errorMessages[appId] ?? options.batchError ?? 'Removal failed'
    }

    apps.push(record)
  }

  return {
    sessionId: randomUUID(),
    startedAt: options.startedAt,
    finishedAt,
    locale: options.locale,
    windowsVersion: options.env.windowsVersion,
    appVersion: app.getVersion(),
    apps,
    summary: {
      total: result.appIds.length,
      succeeded: result.succeeded.length,
      failed: result.failed.length,
      blocked: result.blocked.length
    }
  }
}
