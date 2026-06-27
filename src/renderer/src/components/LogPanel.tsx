import { useEffect, useRef } from 'react'
import { Loader2, PanelRightClose, PanelRightOpen } from 'lucide-react'
import type { LogLine } from '../types/log'
import { useTranslation } from '../i18n'

interface LogPanelProps {
  open: boolean
  lines: LogLine[]
  isRemoving: boolean
  wingetAvailable?: boolean
  onToggle: () => void
  onClear: () => void
}

const LOG_STYLES: Record<LogLine['type'], string> = {
  info: 'text-stone-600 dark:text-stone-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  blocked: 'text-amber-600 dark:text-amber-400',
  warn: 'text-amber-600 dark:text-amber-400'
}

const LOG_PREFIX: Record<LogLine['type'], string> = {
  info: 'info',
  success: 'success',
  error: 'error',
  blocked: 'blocked',
  warn: 'warn'
}

function LogPanel({
  open,
  lines,
  isRemoving,
  wingetAvailable,
  onToggle,
  onClear
}: LogPanelProps): React.JSX.Element {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [lines])

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={t.logPanel.openLogPanel}
        className="transition-smooth flex w-10 shrink-0 flex-col items-center justify-center gap-1 border-l border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <PanelRightOpen className="h-4 w-4" />
        <span className="text-[10px] font-medium [writing-mode:vertical-rl]">{t.logPanel.title}</span>
      </button>
    )
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900/80">
      <div className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.logPanel.title}
            </span>
            {isRemoving ? (
              <span className="flex items-center gap-1.5 text-[10px] text-accent">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="animate-pulse">{t.logPanel.removing}</span>
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 dark:text-stone-500">{t.logPanel.ready}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClear}
              className="transition-smooth rounded px-1.5 py-0.5 text-[10px] text-stone-500 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              {t.logPanel.clearLog}
            </button>
            <button
              type="button"
              onClick={onToggle}
              aria-label={t.logPanel.closeLogPanel}
              className="transition-smooth rounded p-1 text-stone-500 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
        </div>
        {wingetAvailable !== undefined && (
          <p
            className="mt-1 text-[10px] text-stone-400 dark:text-stone-500"
            title="Winget is used as a fallback uninstaller for some apps"
          >
            {wingetAvailable ? t.logPanel.wingetAvailable : t.logPanel.wingetMissing}
          </p>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
      >
        {lines.map((line) => (
          <div key={line.id} className={`mb-1.5 ${LOG_STYLES[line.type]}`}>
            <span className="opacity-60">{LOG_PREFIX[line.type]}:</span> {line.message}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default LogPanel
