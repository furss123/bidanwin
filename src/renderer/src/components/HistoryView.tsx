import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  History,
  Loader2,
  Trash2,
  Upload
} from 'lucide-react'
import type { HistoryFile, RemovalSession, RemovalStatus, RemovedAppRecord } from '@shared/history'
import { getCategoryIcon } from '../ui/categoryMeta'
import { interpolate, useTranslation } from '../i18n'
import ConfirmModal from './ConfirmModal'

type StatusFilter = 'all' | RemovalStatus

interface HistoryViewProps {
  onLog?: (type: 'info' | 'error' | 'warn', message: string) => void
}

function formatDateTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

function formatTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    timeStyle: 'medium'
  }).format(new Date(timestamp))
}

function pathToFileUrl(path: string): string {
  return `file:///${path.replace(/\\/g, '/')}`
}

function StatusBadge({ status }: { status: RemovalStatus }): React.JSX.Element {
  const { t } = useTranslation()
  const styles: Record<RemovalStatus, string> = {
    succeeded:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    blocked: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
  }
  const labels: Record<RemovalStatus, string> = {
    succeeded: t.history.succeeded,
    failed: t.history.failed,
    blocked: t.history.blocked
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function SessionCard({
  session,
  filter,
  defaultOpen
}: {
  session: RemovalSession
  filter: StatusFilter
  defaultOpen?: boolean
}): React.JSX.Element | null {
  const { t, locale } = useTranslation()
  const [open, setOpen] = useState(defaultOpen ?? false)

  const visibleApps = useMemo(() => {
    if (filter === 'all') return session.apps
    return session.apps.filter((app) => app.status === filter)
  }, [filter, session.apps])

  if (visibleApps.length === 0) return null

  const dateLabel = interpolate(t.history.sessionLabel, {
    date: formatDateTime(session.startedAt, locale),
    n: session.summary.total
  })

  return (
    <section className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transition-smooth flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-stone-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-stone-500" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{dateLabel}</p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {t.history.windowsVersion}: {session.windowsVersion} · {t.history.appVersion}:{' '}
            {session.appVersion}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {session.summary.succeeded > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              {session.summary.succeeded} {t.history.succeeded}
            </span>
          )}
          {session.summary.failed > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-300">
              {session.summary.failed} {t.history.failed}
            </span>
          )}
          {session.summary.blocked > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              {session.summary.blocked} {t.history.blocked}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-200 px-4 py-3 dark:border-stone-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  <th className="pb-2 pr-3 font-medium">{t.history.appColumn}</th>
                  <th className="pb-2 pr-3 font-medium">{t.history.statusColumn}</th>
                  <th className="pb-2 pr-3 font-medium">{t.history.errorColumn}</th>
                  <th className="pb-2 font-medium">{t.history.timeColumn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {visibleApps.map((app: RemovedAppRecord) => {
                  const Icon = getCategoryIcon(app.category)
                  return (
                    <tr key={`${session.sessionId}-${app.appId}`}>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-stone-400" />
                          <span className="text-stone-900 dark:text-stone-100">{app.appName}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="max-w-xs py-2 pr-3 text-xs text-stone-500 dark:text-stone-400">
                        {app.errorMessage ?? '—'}
                      </td>
                      <td className="py-2 text-xs text-stone-500 dark:text-stone-400">
                        {formatTime(app.timestamp, locale)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

function HistoryView({ onLog }: HistoryViewProps): React.JSX.Element {
  const { t, locale } = useTranslation()
  const [history, setHistory] = useState<HistoryFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [historyPath, setHistoryPath] = useState<string | null>(null)

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      const [file, path] = await Promise.all([
        window.api.getHistory(),
        window.api.getHistoryPath()
      ])
      setHistory(file)
      setHistoryPath(path)
    } catch {
      setHistory({ version: '1', sessions: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const unsub = window.api.onRemovalDone(() => {
      void load()
    })
    return unsub
  }, [load])

  const sortedSessions = useMemo(() => {
    if (!history) return []
    return [...history.sessions].sort((a, b) => b.startedAt - a.startedAt)
  }, [history])

  const visibleSessions = useMemo(() => {
    if (filter === 'all') return sortedSessions
    return sortedSessions.filter((session) =>
      session.apps.some((app) => app.status === filter)
    )
  }, [filter, sortedSessions])

  const filterOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: t.history.filterAll },
    { id: 'succeeded', label: t.history.succeeded },
    { id: 'failed', label: t.history.failed },
    { id: 'blocked', label: t.history.blocked }
  ]

  async function handleExport(): Promise<void> {
    try {
      const result = await window.api.exportHistory()
      if (result.cancelled) {
        onLog?.('info', t.history.exportCancelled)
        return
      }
      if (result.filePath) {
        onLog?.('info', interpolate(t.history.exportSuccess, { path: result.filePath }))
      }
    } catch {
      onLog?.('error', t.history.exportFailed)
    }
  }

  async function handleOpenFileLocation(): Promise<void> {
    if (!historyPath) {
      onLog?.('warn', t.history.noPath)
      return
    }
    try {
      await window.api.openExternal(pathToFileUrl(historyPath))
    } catch {
      onLog?.('error', t.history.noPath)
    }
  }

  async function handleClearConfirmed(): Promise<void> {
    setConfirmClearOpen(false)
    try {
      await window.api.clearHistory()
      await load()
      onLog?.('info', t.history.cleared)
    } catch {
      onLog?.('error', t.history.exportFailed)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t.history.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={loading}
            className="transition-smooth inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Upload className="h-4 w-4" />
            {t.history.export}
          </button>
          <button
            type="button"
            onClick={() => void handleOpenFileLocation()}
            disabled={loading || !historyPath}
            className="transition-smooth inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <FolderOpen className="h-4 w-4" />
            {t.history.openFile}
          </button>
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            disabled={loading || sortedSessions.length === 0}
            className="transition-smooth inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            {t.history.clearAll}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={`transition-smooth rounded-full px-3 py-1 text-xs font-medium ${
              filter === option.id
                ? 'bg-accent text-white'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-stone-500 dark:text-stone-400">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : visibleSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900/40">
          <History className="mb-3 h-8 w-8 text-stone-400" />
          <p className="text-sm text-stone-600 dark:text-stone-400">{t.history.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSessions.map((session, index) => (
            <SessionCard
              key={session.sessionId}
              session={session}
              filter={filter}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmClearOpen}
        title={t.history.clearAll}
        warning={t.history.confirmClear}
        confirmBtn={t.history.clearAll}
        hideAppList
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={() => void handleClearConfirmed()}
      />
    </div>
  )
}

export default HistoryView
