import { Loader2 } from 'lucide-react'
import { interpolate, useTranslation } from '../i18n'

interface ActionBarProps {
  selectedCount: number
  removeDisabled: boolean
  removeDisabledReason: string | null
  isRemoving: boolean
  onSelectRecommended: () => void
  onClear: () => void
  onRemoveSelected: () => void
}

function ActionBar({
  selectedCount,
  removeDisabled,
  removeDisabledReason,
  isRemoving,
  onSelectRecommended,
  onClear,
  onRemoveSelected
}: ActionBarProps): React.JSX.Element {
  const { t } = useTranslation()
  const removeBlocked = selectedCount === 0 || removeDisabled || isRemoving

  return (
    <footer className="flex shrink-0 items-center gap-3 border-t border-stone-200 bg-white/90 px-5 py-3 backdrop-blur">
      <span className="min-w-[6rem] text-sm text-stone-600">
        {interpolate(t.actionBar.selected, { n: selectedCount })}
      </span>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={onSelectRecommended}
          disabled={isRemoving}
          className="transition-smooth rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.actionBar.selectRecommended}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={selectedCount === 0 || isRemoving}
          className="transition-smooth rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.actionBar.clear}
        </button>
        <button
          type="button"
          onClick={onRemoveSelected}
          disabled={removeBlocked}
          title={removeDisabled ? (removeDisabledReason ?? undefined) : undefined}
          className="transition-smooth flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isRemoving ? t.actionBar.removing : t.actionBar.removeSelected}
        </button>
      </div>
    </footer>
  )
}

export default ActionBar
