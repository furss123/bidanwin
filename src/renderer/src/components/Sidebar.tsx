import { BookOpen, History, Info, Loader2 } from 'lucide-react'
import type { OemDetectionResult } from '@shared/oemCatalog'
import {
  CATEGORY_NAV,
  getCategoryLabelKey,
  getOemNavLabel,
  type CategoryFilter,
  type SidebarView
} from '../ui/categoryMeta'
import { useTranslation } from '../i18n'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'

interface SidebarProps {
  activeView: SidebarView
  categoryCounts: Record<CategoryFilter, number>
  oemDetectionResult: OemDetectionResult | null
  theme: 'light' | 'dark'
  onViewChange: (view: SidebarView) => void
  onThemeToggle: () => void
}

function Sidebar({
  activeView,
  categoryCounts,
  oemDetectionResult,
  theme,
  onViewChange,
  onThemeToggle
}: SidebarProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-stone-200 bg-stone-100/80 dark:border-stone-800 dark:bg-stone-900/50">
      <div className="border-b border-stone-200 px-4 py-5 dark:border-stone-800">
        <p className="text-base font-semibold leading-tight text-stone-900 dark:text-stone-100">
          {t.sidebar.wordmark}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">{t.sidebar.wordmarkSub}</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {CATEGORY_NAV.map(({ id, icon: Icon }) => {
          const isActive = activeView === id
          const count = categoryCounts[id]
          const isOem = id === 'oem'
          const oemDetecting = isOem && oemDetectionResult === null
          const oemUnknown = isOem && oemDetectionResult?.manufacturer === 'unknown'

          const label = isOem
            ? getOemNavLabel(oemDetectionResult, t.oem.manufacturers, t.oem.navLabel)
            : t.sidebar.categories[getCategoryLabelKey(id)]

          const tooltip = oemUnknown ? t.oem.unknownManufacturer : undefined

          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              title={tooltip}
              className={`transition-smooth flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                isActive
                  ? 'bg-accent-muted font-medium text-accent dark:bg-accent/15'
                  : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800'
              }`}
            >
              {oemDetecting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  isActive
                    ? 'bg-accent/20 text-accent'
                    : 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="space-y-0.5 border-t border-stone-200 px-2 py-2 dark:border-stone-800">
        <button
          type="button"
          onClick={() => onViewChange('history')}
          className={`transition-smooth flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
            activeView === 'history'
              ? 'bg-accent-muted font-medium text-accent dark:bg-accent/15'
              : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          <History className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{t.history.navLabel}</span>
        </button>
      </div>

      <div className="space-y-2 border-t border-stone-200 px-2 py-2 dark:border-stone-800">
        <button
          type="button"
          onClick={() => onViewChange('restore_guide')}
          className={`transition-smooth flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
            activeView === 'restore_guide'
              ? 'bg-accent-muted font-medium text-accent dark:bg-accent/15'
              : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{t.sidebar.restoreGuide}</span>
        </button>
        <button
          type="button"
          onClick={() => onViewChange('about')}
          className={`transition-smooth flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
            activeView === 'about'
              ? 'bg-accent-muted font-medium text-accent dark:bg-accent/15'
              : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          <Info className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{t.sidebar.about}</span>
        </button>
        <LanguageToggle />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </aside>
  )
}

export default Sidebar
