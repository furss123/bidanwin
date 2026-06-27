// Preload script — exposes a typed, sandboxed API to the renderer via contextBridge
import { contextBridge, ipcRenderer } from 'electron'
import type { CatalogUpdateResult } from '../shared/catalogUpdate'
import type { OemDetectionResult } from '../shared/oemCatalog'
import type { HistoryFile } from '../shared/history'
import type { Locale } from '../shared/i18n'
import type { EnvInfo } from '../shared/env'
import type { RemovalLogLine, RemovalResult } from '../shared/removal'
import type { RestorePointResult } from '../shared/restore'

export interface RelaunchResult {
  success: boolean
  cancelled?: boolean
  error?: string
}

const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  setLocale: (locale: Locale): Promise<void> => ipcRenderer.invoke('set-locale', locale),
  getEnvironment: (): Promise<EnvInfo> => ipcRenderer.invoke('get-environment'),
  relaunchElevated: (): Promise<RelaunchResult> => ipcRenderer.invoke('relaunch-elevated'),
  createRestorePoint: (): Promise<RestorePointResult> => ipcRenderer.invoke('create-restore-point'),
  openSystemRestore: (): Promise<void> => ipcRenderer.invoke('open-system-restore'),
  openMicrosoftStore: (): Promise<void> => ipcRenderer.invoke('open-microsoft-store'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open-external', url),
  openLicense: (): Promise<void> => ipcRenderer.invoke('open-license'),
  getHistory: (): Promise<HistoryFile> => ipcRenderer.invoke('get-history'),
  clearHistory: (): Promise<void> => ipcRenderer.invoke('clear-history'),
  getHistoryPath: (): Promise<string> => ipcRenderer.invoke('get-history-path'),
  exportHistory: (): Promise<{ cancelled: boolean; filePath?: string }> =>
    ipcRenderer.invoke('export-history'),
  checkCatalogUpdate: (force?: boolean): Promise<CatalogUpdateResult> =>
    ipcRenderer.invoke('check-catalog-update', { force: force ?? false }),
  dismissCatalogUpdate: (): Promise<void> => ipcRenderer.invoke('dismiss-catalog-update'),
  getLastCatalogUpdateResult: (): Promise<CatalogUpdateResult | null> =>
    ipcRenderer.invoke('get-last-catalog-update-result'),
  getDismissedCatalogVersion: (): Promise<string | null> =>
    ipcRenderer.invoke('get-dismissed-catalog-version'),
  getOemDetectionResult: (): Promise<OemDetectionResult | null> =>
    ipcRenderer.invoke('get-oem-detection-result'),
  startRemoval: (appIds: string[]): Promise<void> =>
    ipcRenderer.invoke('start-removal', { appIds }),
  onRemovalLog: (callback: (line: RemovalLogLine) => void): (() => void) => {
    const handler = (_event: unknown, line: RemovalLogLine): void => {
      callback(line)
    }
    ipcRenderer.on('removal-log', handler)
    return () => {
      ipcRenderer.removeListener('removal-log', handler)
    }
  },
  onRemovalDone: (callback: (result: RemovalResult) => void): (() => void) => {
    const handler = (_event: unknown, result: RemovalResult): void => {
      callback(result)
    }
    ipcRenderer.on('removal-done', handler)
    return () => {
      ipcRenderer.removeListener('removal-done', handler)
    }
  },
  onCatalogUpdateResult: (callback: (result: CatalogUpdateResult) => void): (() => void) => {
    const handler = (_event: unknown, result: CatalogUpdateResult): void => {
      callback(result)
    }
    ipcRenderer.on('catalog-update-result', handler)
    return () => {
      ipcRenderer.removeListener('catalog-update-result', handler)
    }
  },
  onOemDetectionResult: (callback: (result: OemDetectionResult) => void): (() => void) => {
    const handler = (_event: unknown, result: OemDetectionResult): void => {
      callback(result)
    }
    ipcRenderer.on('oem-detection-result', handler)
    return () => {
      ipcRenderer.removeListener('oem-detection-result', handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
