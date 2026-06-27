// Electron main process — creates the window and handles IPC from the renderer
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { isAbsolute, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { CATALOG, isBlocked } from '../shared/catalog'
import { en, ko, type Locale } from '../shared/i18n'
import { getEnvironment, isElevated, relaunchElevated } from './environment'
import {
  appendSession,
  buildRemovalSession,
  clearHistory,
  exportHistoryToFile,
  getHistoryFilePath,
  loadHistory
} from './history'
import { runDryRunSmokeTest, runRemovalBatch } from './removal'
import { createRestorePoint } from './restorePoint'
import type { RemovalResult } from '../shared/removal'
import {
  checkForUpdates,
  dismissCatalogUpdate,
  getDismissedCatalogVersion,
  getLastCatalogUpdateResult,
  runStartupCatalogCheck
} from './catalogUpdater'
import { detectOemApps, getOemDetectionResult } from './oemDetector'

const MAX_BATCH_SIZE = 50

let mainWindow: BrowserWindow | null = null
let removalInProgress = false
let currentLocale: Locale = 'ko'

function getCloseGuardStrings(): (typeof ko)['closeGuard'] {
  return currentLocale === 'en' ? en.closeGuard : ko.closeGuard
}

const ICON_PATH = join(__dirname, '../../build/icons/icon.ico')
const ICON_PNG_PATH = join(__dirname, '../../build/icons/icon.png')

function isAllowedFileUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'file:') return false
    const filePath = fileURLToPath(parsed)
    const userData = app.getPath('userData')
    const rel = relative(userData, filePath)
    return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
  } catch {
    return false
  }
}

function isAllowedExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || url.startsWith('ms-windows-store://')) {
      return true
    }
    if (parsed.protocol === 'file:') {
      return isAllowedFileUrl(url)
    }
    return false
  } catch {
    return false
  }
}

function resolveLicensePath(): string {
  const packaged = join(process.resourcesPath, 'LICENSE')
  if (existsSync(packaged)) return packaged
  return join(app.getAppPath(), 'LICENSE')
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 620,
    title: '비단윈 BidanWin',
    icon: existsSync(ICON_PATH) ? ICON_PATH : existsSync(ICON_PNG_PATH) ? ICON_PNG_PATH : undefined,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.on('close', (event) => {
    if (!removalInProgress) return

    event.preventDefault()
    const guard = getCloseGuardStrings()
    const choice = dialog.showMessageBoxSync(win, {
      type: 'warning',
      message: guard.message,
      buttons: [guard.cancel, guard.quit],
      defaultId: 0,
      cancelId: 0
    })

    if (choice === 1) {
      removalInProgress = false
      win.destroy()
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function validateRemovalRequest(
  appIds: string[]
): { ok: true; ids: string[] } | { ok: false; error: string } {
  if (process.platform !== 'win32') {
    return { ok: false, error: 'Removal is only supported on Windows' }
  }

  if (!isElevated()) {
    return { ok: false, error: 'Administrator privileges required' }
  }

  if (appIds.length > MAX_BATCH_SIZE) {
    return { ok: false, error: 'Batch too large — max 50 apps at once' }
  }

  // Defense in depth: re-validate every id against CATALOG + NEVER_REMOVE
  const validIds: string[] = []
  for (const id of appIds) {
    const entry = CATALOG.find((app) => app.id === id)
    if (!entry) continue
    if (entry.packagePatterns.some((pattern) => isBlocked(pattern))) continue
    validIds.push(id)
  }

  if (validIds.length === 0) {
    return { ok: false, error: 'No valid apps to remove after safety checks' }
  }

  return { ok: true, ids: validIds }
}

function sendRemovalFailure(webContents: Electron.WebContents, appIds: string[], error: string): void {
  if (webContents.isDestroyed()) return
  webContents.send('removal-log', {
    type: 'error',
    appId: '_batch',
    message: error,
    timestamp: Date.now()
  })
  const result = {
    appIds,
    succeeded: [] as string[],
    failed: appIds,
    blocked: [] as string[]
  }
  webContents.send('removal-done', result)
  persistRemovalSession(result, Date.now(), { batchError: error })
}

function persistRemovalSession(
  result: RemovalResult,
  startedAt: number,
  options?: { batchError?: string; errorMessages?: Record<string, string> }
): void {
  const env = getEnvironment()
  const session = buildRemovalSession(result, {
    startedAt,
    locale: currentLocale,
    env,
    errorMessages: options?.errorMessages ?? {},
    batchError: options?.batchError
  })
  void appendSession(session).catch((err) => {
    console.error('History save failed:', err)
  })
}

ipcMain.handle('ping', () => 'pong')

ipcMain.handle('set-locale', (_event, locale: unknown) => {
  if (locale === 'ko' || locale === 'en') {
    currentLocale = locale
  }
})

ipcMain.handle('get-environment', () => getEnvironment())

ipcMain.handle('relaunch-elevated', () => relaunchElevated())

ipcMain.handle('create-restore-point', () => createRestorePoint())

ipcMain.handle('open-system-restore', async () => {
  if (process.platform !== 'win32') return
  spawn('rstrui.exe', [], { detached: true, windowsHide: true })
})

ipcMain.handle('open-microsoft-store', async () => {
  await shell.openExternal('ms-windows-store://')
})

ipcMain.handle('open-external', async (_event, url: string) => {
  if (typeof url !== 'string' || !isAllowedExternalUrl(url)) {
    throw new Error('URL protocol not allowed')
  }
  await shell.openExternal(url)
})

ipcMain.handle('open-license', async () => {
  const licensePath = resolveLicensePath()
  if (!existsSync(licensePath)) {
    throw new Error('LICENSE file not found')
  }
  await shell.openPath(licensePath)
})

ipcMain.handle('get-history', () => loadHistory())

ipcMain.handle('clear-history', () => clearHistory())

ipcMain.handle('get-history-path', () => getHistoryFilePath())

ipcMain.handle('export-history', async () => {
  if (!mainWindow) {
    throw new Error('Application window is not ready')
  }

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export removal history',
    defaultPath: 'bidanwin-history.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })

  if (canceled || !filePath) {
    return { cancelled: true }
  }

  await exportHistoryToFile(filePath)
  return { cancelled: false, filePath }
})

ipcMain.handle('check-catalog-update', (_event, options?: { force?: boolean }) =>
  checkForUpdates(app.getVersion(), { force: options?.force ?? false })
)

ipcMain.handle('dismiss-catalog-update', () => dismissCatalogUpdate())

ipcMain.handle('get-last-catalog-update-result', () => getLastCatalogUpdateResult())

ipcMain.handle('get-dismissed-catalog-version', () => getDismissedCatalogVersion())

ipcMain.handle('get-oem-detection-result', () => getOemDetectionResult())

ipcMain.handle('start-removal', async (_event, payload: { appIds: string[] }) => {
  if (!mainWindow) {
    throw new Error('Application window is not ready')
  }

  if (removalInProgress) {
    throw new Error('A removal batch is already in progress')
  }

  const appIds = payload?.appIds
  if (!Array.isArray(appIds) || appIds.length === 0) {
    throw new Error('No app IDs provided for removal')
  }

  const webContents = mainWindow.webContents
  const validation = validateRemovalRequest(appIds)

  if (!validation.ok) {
    sendRemovalFailure(webContents, appIds, validation.error)
    return
  }

  removalInProgress = true
  const batchStartedAt = Date.now()
  const errorMessages: Record<string, string> = {}

  void runRemovalBatch(validation.ids, {
    onLog: (line) => {
      if (line.type === 'error' && line.appId !== '_batch') {
        errorMessages[line.appId] = line.message
      }
      if (!webContents.isDestroyed()) {
        webContents.send('removal-log', line)
      }
    }
  })
    .then((result) => {
      if (!webContents.isDestroyed()) {
        webContents.send('removal-done', result)
      }
      persistRemovalSession(result, batchStartedAt, { errorMessages })
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : String(err)
      sendRemovalFailure(webContents, validation.ids, `Batch error: ${message}`)
    })
    .finally(() => {
      removalInProgress = false
    })
})

app.whenReady().then(() => {
  mainWindow = createWindow()

  mainWindow.webContents.once('did-finish-load', () => {
    void runStartupCatalogCheck(app.getVersion(), (result) => {
      if (mainWindow && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.send('catalog-update-result', result)
      }
    })

    void getEnvironment().then((env) => {
      void detectOemApps(env.wingetAvailable).then((result) => {
        if (mainWindow && !mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('oem-detection-result', result)
        }
      })
    })
  })

  if (process.env.BIDANWIN_TEST_REMOVAL === '1') {
    mainWindow.webContents.once('did-finish-load', () => {
      void runDryRunSmokeTest()
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
