import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { CATALOG } from '@shared/catalog'
import type { CatalogUpdateResult } from '@shared/catalogUpdate'
import type { OemDetectionResult } from '@shared/oemCatalog'
import { oemAppToBloatApp } from '@shared/oemCatalog'
import { canPerformRemoval, type EnvInfo } from '@shared/env'
import type { TranslationSchema } from '@shared/i18n'
import type { RemovalLogLine } from '@shared/removal'
import type { BloatApp } from '@shared/types'
import AboutScreen from './components/AboutScreen'
import ActionBar from './components/ActionBar'
import AppCard from './components/AppCard'
import CatalogUpdateBanner from './components/CatalogUpdateBanner'
import ConfirmModal from './components/ConfirmModal'
import HistoryView from './components/HistoryView'
import LogPanel from './components/LogPanel'
import RestoreGuide from './components/RestoreGuide'
import RestorePointModal from './components/RestorePointModal'
import Sidebar from './components/Sidebar'
import StatusBanner from './components/StatusBanner'
import { getCategoryLabelKey, getOemNavLabel, type CategoryFilter, type SidebarView } from './ui/categoryMeta'
import { interpolate, useTranslation } from './i18n'
import { createLogLine, type LogLine } from './types/log'

function filterByCategory(apps: BloatApp[], category: CategoryFilter): BloatApp[] {
  if (category === 'all') return apps
  return apps.filter((app) => app.category === category)
}

function removalLogToUiLine(line: RemovalLogLine): LogLine {
  const type = line.type === 'warn' ? 'warn' : line.type
  return {
    id: `${line.timestamp}-${line.appId}-${line.message.slice(0, 32)}`,
    type,
    message: line.message
  }
}

function getAppNames(ids: string[], catalog: BloatApp[]): string[] {
  return ids
    .map((id) => catalog.find((app) => app.id === id)?.name)
    .filter((name): name is string => Boolean(name))
}

function mergeIntoActiveCatalog(
  current: BloatApp[],
  newApps: BloatApp[],
  removedIds: string[]
): BloatApp[] {
  const byId = new Map(current.map((app) => [app.id, app]))
  for (const app of newApps) {
    byId.set(app.id, app)
  }
  for (const id of removedIds) {
    byId.delete(id)
  }
  return Array.from(byId.values())
}

function getRemovalBlockReason(env: EnvInfo | null, t: TranslationSchema): string | null {
  if (!env) return t.statusBanner.checkingEnv
  if (!env.isWindows) return t.statusBanner.previewMode
  if (!env.powershellAvailable) return t.statusBanner.powershellMissing
  if (!env.isAdmin) return t.statusBanner.adminRequired
  return null
}

function App(): React.JSX.Element {
  const { t } = useTranslation()
  const [activeCatalog, setActiveCatalog] = useState<BloatApp[]>(() => [...CATALOG])
  const [updateResult, setUpdateResult] = useState<CatalogUpdateResult | null>(null)
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)
  const [newAppIds, setNewAppIds] = useState<Set<string>>(new Set())
  const [highlightNewIds, setHighlightNewIds] = useState(false)
  const [oemDetectionResult, setOemDetectionResult] = useState<OemDetectionResult | null>(null)
  const [activeView, setActiveView] = useState<SidebarView>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [logLines, setLogLines] = useState<LogLine[]>(() => [
    createLogLine('info', t.logPanel.ready),
    createLogLine('info', t.logPanel.catalogLoaded)
  ])
  const [logPanelOpen, setLogPanelOpen] = useState(true)
  const [env, setEnv] = useState<EnvInfo | null>(null)
  const [relaunching, setRelaunching] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [restoreModalAppIds, setRestoreModalAppIds] = useState<string[] | null>(null)
  const [confirmAppIds, setConfirmAppIds] = useState<string[] | null>(null)
  const mainScrollRef = useRef<HTMLElement>(null)

  const removalAllowed = canPerformRemoval(env)
  const removeBlockReason = getRemovalBlockReason(env, t)
  const removeActionDisabled = !removalAllowed || isRemoving
  const showRestoreGuide = activeView === 'restore_guide'
  const showAbout = activeView === 'about'
  const showHistory = activeView === 'history'
  const showCatalog =
    activeView !== 'restore_guide' && activeView !== 'about' && activeView !== 'history'
  const activeCategory: CategoryFilter = showCatalog ? activeView : 'all'

  const appendLog = useCallback((type: LogLine['type'], message: string): void => {
    setLogLines((prev) => [...prev, createLogLine(type, message)])
  }, [])

  const applyCatalogUpdate = useCallback((result: CatalogUpdateResult): void => {
    setUpdateResult(result)
    if (result.status === 'updated' && (result.newApps.length > 0 || result.removedIds.length > 0)) {
      setActiveCatalog((prev) => mergeIntoActiveCatalog(prev, result.newApps, result.removedIds))
      if (result.newApps.length > 0) {
        setNewAppIds((prev) => {
          const next = new Set(prev)
          for (const app of result.newApps) {
            next.add(app.id)
          }
          return next
        })
      }
    }
  }, [])

  const tRef = useRef(t)
  tRef.current = t

  useEffect(() => {
    window.api
      .getEnvironment()
      .then((info) => {
        setEnv(info)
        appendLog(
          'info',
          interpolate(tRef.current.logPanel.environmentLog, {
            windowsVersion: info.windowsVersion,
            isAdmin: String(info.isAdmin),
            powershellAvailable: String(info.powershellAvailable),
            wingetAvailable: String(info.wingetAvailable)
          })
        )
      })
      .catch(() => {
        appendLog('error', tRef.current.logPanel.envLoadFailed)
      })
  }, [appendLog])

  useEffect(() => {
    void window.api.getDismissedCatalogVersion().then(setDismissedVersion)
    void window.api.getLastCatalogUpdateResult().then((result) => {
      if (result) applyCatalogUpdate(result)
    })

    const unsub = window.api.onCatalogUpdateResult((result) => {
      applyCatalogUpdate(result)
    })
    return unsub
  }, [applyCatalogUpdate])

  const applyOemDetection = useCallback(
    (result: OemDetectionResult): void => {
      setOemDetectionResult(result)
      if (result.installedOemApps.length > 0) {
        const bloatApps = result.installedOemApps.map(oemAppToBloatApp)
        setActiveCatalog((prev) => mergeIntoActiveCatalog(prev, bloatApps, []))
      }
      if (result.wingetScanSkipped) {
        appendLog('warn', tRef.current.oem.wingetScanSkipped)
      }
    },
    [appendLog]
  )

  useEffect(() => {
    void window.api.getOemDetectionResult().then((result) => {
      if (result) applyOemDetection(result)
    })

    const unsub = window.api.onOemDetectionResult((result) => {
      applyOemDetection(result)
    })
    return unsub
  }, [applyOemDetection])

  useEffect(() => {
    const unsubLog = window.api.onRemovalLog((line) => {
      setLogLines((prev) => [...prev, removalLogToUiLine(line)])
    })

    const unsubDone = window.api.onRemovalDone((result) => {
      setIsRemoving(false)
      setRemovedIds((prev) => {
        const next = new Set(prev)
        for (const id of result.succeeded) {
          next.add(id)
        }
        return next
      })
      setSelectedIds(new Set())
      setLogLines((prev) => [
        ...prev,
        createLogLine(
          'info',
          interpolate(t.logPanel.summary, {
            succeeded: result.succeeded.length,
            failed: result.failed.length,
            blocked: result.blocked.length
          })
        )
      ])
    })

    return () => {
      unsubLog()
      unsubDone()
    }
  }, [t])

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: activeCatalog.length,
      apps: 0,
      games_xbox: 0,
      microsoft: 0,
      widgets_ai: 0,
      oem: 0,
      system: 0
    }
    for (const app of activeCatalog) {
      counts[app.category] += 1
    }
    return counts
  }, [activeCatalog])

  const visibleApps = useMemo(
    () => filterByCategory(activeCatalog, activeCategory),
    [activeCatalog, activeCategory]
  )

  const remainingApps = useMemo(
    () => visibleApps.filter((app) => !removedIds.has(app.id)),
    [visibleApps, removedIds]
  )

  const activeLabel =
    showAbout
      ? t.sidebar.about
      : showRestoreGuide
        ? t.sidebar.restoreGuide
        : showHistory
          ? t.history.title
          : activeCategory === 'oem'
            ? getOemNavLabel(oemDetectionResult, t.oem.manufacturers, t.oem.navLabel)
            : t.sidebar.categories[getCategoryLabelKey(activeCategory)]

  const oemCategorySubtitle =
    activeCategory === 'oem' && oemDetectionResult && oemDetectionResult.manufacturer !== 'unknown'
      ? interpolate(t.oem.detectedAs, {
          manufacturer: t.oem.manufacturers[oemDetectionResult.manufacturer],
          model: oemDetectionResult.model || '—'
        })
      : null

  function proceedToConfirm(appIds: string[]): void {
    setRestoreModalAppIds(null)
    setConfirmAppIds(appIds)
  }

  function requestRemoval(appIds: string[]): void {
    if (!removalAllowed || isRemoving) return

    const pending = appIds.filter((id) => !removedIds.has(id))

    if (pending.length === 0) {
      appendLog('info', t.actionBar.alreadyRemoved)
      return
    }

    setRestoreModalAppIds(pending)
  }

  async function executeRemoval(appIds: string[]): Promise<void> {
    setConfirmAppIds(null)
    setIsRemoving(true)
    appendLog('info', interpolate(t.logPanel.startingRemoval, { n: appIds.length }))

    try {
      await window.api.startRemoval(appIds)
    } catch (err) {
      setIsRemoving(false)
      const message = err instanceof Error ? err.message : String(err)
      appendLog('error', message)
    }
  }

  function handleSelectRecommended(): void {
    const safeIds = visibleApps
      .filter((app) => app.safety === 'safe' && !removedIds.has(app.id))
      .map((app) => app.id)
    setSelectedIds(new Set(safeIds))
    appendLog('info', interpolate(t.logPanel.selectedRecommended, { n: safeIds.length }))
    if (safeIds.length > 20) {
      appendLog('warn', interpolate(t.actionBar.batchWarn, { n: safeIds.length }))
    }
  }

  function handleClear(): void {
    setSelectedIds(new Set())
    appendLog('info', t.logPanel.selectionCleared)
  }

  function handleRemoveSelected(): void {
    requestRemoval(Array.from(selectedIds))
  }

  function handleRemoveSingle(app: BloatApp): void {
    requestRemoval([app.id])
  }

  async function handleRelaunchElevated(): Promise<void> {
    setRelaunching(true)
    try {
      const result = await window.api.relaunchElevated()
      if (result.cancelled) {
        appendLog('info', t.logPanel.elevationCancelled)
      } else if (!result.success && result.error) {
        appendLog('error', interpolate(t.logPanel.elevationFailed, { error: result.error }))
      }
    } catch {
      appendLog('error', t.logPanel.elevationRequestFailed)
    } finally {
      setRelaunching(false)
    }
  }

  function handleDismissCatalogUpdate(): void {
    void window.api.dismissCatalogUpdate()
    setDismissedVersion(updateResult?.remoteVersion ?? null)
    setNewAppIds(new Set())
    setHighlightNewIds(false)
  }

  function handleViewNewApps(): void {
    setActiveView('all')
    setHighlightNewIds(true)
    setSelectedIds(new Set())
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => {
      const firstNewId = updateResult?.newApps[0]?.id
      if (!firstNewId) return
      const el = mainScrollRef.current?.querySelector(`[data-app-id="${firstNewId}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }

  const showUpdateBanner =
    updateResult?.status === 'updated' &&
    updateResult.newApps.length > 0 &&
    updateResult.remoteVersion !== dismissedVersion

  function handleViewChange(view: SidebarView): void {
    setActiveView(view)
    if (view !== 'restore_guide' && view !== 'about' && view !== 'history') {
      setSelectedIds(new Set())
    }
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleClearLog(): void {
    setLogLines([createLogLine('info', t.logPanel.ready)])
  }

  function toggleSelected(id: string): void {
    if (removedIds.has(id)) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div
      className={`${theme === 'dark' ? 'dark' : ''} flex h-screen bg-surface-light text-stone-900 dark:bg-surface-dark dark:text-stone-100`}
    >
      <Sidebar
        activeView={activeView}
        categoryCounts={categoryCounts}
        oemDetectionResult={oemDetectionResult}
        theme={theme}
        onViewChange={handleViewChange}
        onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">
          <main ref={mainScrollRef} className="min-w-0 flex-1 overflow-y-auto px-5 py-5">
            {showCatalog && (
              <>
                <StatusBanner
                  env={env}
                  relaunching={relaunching}
                  onRelaunchElevated={handleRelaunchElevated}
                />
                {showUpdateBanner && updateResult && (
                  <CatalogUpdateBanner
                    updateResult={updateResult}
                    onViewNew={handleViewNewApps}
                    onDismiss={handleDismissCatalogUpdate}
                  />
                )}
              </>
            )}

            {showAbout ? (
              <AboutScreen
                env={env}
                oemDetectionResult={oemDetectionResult}
                onCatalogUpdate={applyCatalogUpdate}
              />
            ) : showRestoreGuide ? (
              <RestoreGuide removedIds={removedIds} />
            ) : showHistory ? (
              <HistoryView
                onLog={(type, message) => appendLog(type, message)}
              />
            ) : (
              <>
                <header className="mb-5">
                  <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {activeLabel}
                  </h1>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {oemCategorySubtitle ??
                      (removalAllowed ? t.app.subtitleAllowed : t.app.subtitleGated)}
                  </p>
                </header>

                {activeCategory === 'oem' && oemDetectionResult === null ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900/40">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-accent" />
                    <p className="text-sm text-stone-600 dark:text-stone-400">{t.oem.detecting}</p>
                  </div>
                ) : activeCategory === 'oem' &&
                  (oemDetectionResult?.manufacturer === 'unknown' || visibleApps.length === 0) ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900/40">
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {oemDetectionResult?.manufacturer === 'unknown'
                        ? t.oem.unknownManufacturer
                        : t.oem.noAppsFound}
                    </p>
                  </div>
                ) : remainingApps.length === 0 && visibleApps.length > 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900/40">
                    <Check className="mb-3 h-8 w-8 text-accent" strokeWidth={2.5} />
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                      {t.emptyState.message}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleApps.map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        selected={selectedIds.has(app.id)}
                        isRemoved={removedIds.has(app.id)}
                        isNew={newAppIds.has(app.id)}
                        isHighlighted={highlightNewIds && newAppIds.has(app.id)}
                        removeDisabled={removeActionDisabled}
                        removeDisabledReason={removeBlockReason}
                        onToggle={() => toggleSelected(app.id)}
                        onRemove={() => handleRemoveSingle(app)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>

          <LogPanel
            open={logPanelOpen}
            lines={logLines}
            isRemoving={isRemoving}
            wingetAvailable={env?.wingetAvailable}
            onToggle={() => setLogPanelOpen((o) => !o)}
            onClear={handleClearLog}
          />
        </div>

        {showCatalog ? (
          <ActionBar
            selectedCount={selectedIds.size}
            removeDisabled={!removalAllowed}
            removeDisabledReason={removeBlockReason}
            isRemoving={isRemoving}
            onSelectRecommended={handleSelectRecommended}
            onClear={handleClear}
            onRemoveSelected={handleRemoveSelected}
          />
        ) : null}
      </div>

      <RestorePointModal
        open={restoreModalAppIds !== null}
        onCancel={() => setRestoreModalAppIds(null)}
        onSkip={() => {
          if (restoreModalAppIds) proceedToConfirm(restoreModalAppIds)
        }}
        onContinue={() => {
          if (restoreModalAppIds) proceedToConfirm(restoreModalAppIds)
        }}
        onLogWarning={(message) => appendLog('warn', message)}
      />

      <ConfirmModal
        open={confirmAppIds !== null}
        appNames={confirmAppIds ? getAppNames(confirmAppIds, activeCatalog) : []}
        onCancel={() => setConfirmAppIds(null)}
        onConfirm={() => {
          if (confirmAppIds) {
            void executeRemoval(confirmAppIds)
          }
        }}
      />
    </div>
  )
}

export default App
