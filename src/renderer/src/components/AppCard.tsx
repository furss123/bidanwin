import { AlertTriangle, Check } from 'lucide-react'
import type { BloatApp } from '@shared/types'
import { getCategoryIcon } from '../ui/categoryMeta'
import { useTranslation } from '../i18n'

interface AppCardProps {
  app: BloatApp
  selected: boolean
  isRemoved: boolean
  isNew?: boolean
  isHighlighted?: boolean
  removeDisabled: boolean
  removeDisabledReason: string | null
  onToggle: () => void
  onRemove: () => void
}

function AppCard({
  app,
  selected,
  isRemoved,
  isNew = false,
  isHighlighted = false,
  removeDisabled,
  removeDisabledReason,
  onToggle,
  onRemove
}: AppCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const Icon = getCategoryIcon(app.category)
  const isCaution = app.safety === 'caution'

  return (
    <article
      data-app-id={app.id}
      className={`transition-smooth group flex items-start gap-4 rounded-xl border p-4 shadow-card ${
        isCaution
          ? 'border-amber-200/80 bg-amber-50/40'
          : 'border-stone-200/80 bg-white'
      } ${isRemoved ? 'opacity-50' : ''} ${selected && !isRemoved ? 'ring-2 ring-accent/40' : ''} ${
        isHighlighted ? 'ring-2 ring-accent' : ''
      } ${!isRemoved ? 'hover:border-stone-300' : ''}`}
    >
      <label className={`mt-1 flex items-center ${isRemoved ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={selected}
          disabled={isRemoved}
          onChange={onToggle}
          className="h-4 w-4 cursor-pointer rounded border-stone-300 text-accent transition-smooth focus:ring-accent focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isCaution
            ? 'bg-amber-100 text-amber-700'
            : 'bg-stone-100 text-stone-600'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-stone-900">{app.name}</h3>
          {isNew && !isRemoved && (
            <span className="inline-flex rounded-full border border-accent px-2 py-0.5 text-xs font-semibold text-accent">
              {t.catalogUpdate.newBadge}
            </span>
          )}
          {isCaution && !isRemoved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3 w-3" />
              {t.appCard.cautionBadge}
            </span>
          )}
          {isRemoved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              <Check className="h-3 w-3" />
              {t.appCard.removed}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-stone-500">{app.description}</p>
        {app.note && !isRemoved && (
          <p className="mt-1 text-xs text-amber-700/80">{app.note}</p>
        )}
      </div>

      {isRemoved ? (
        <span className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
          {t.appCard.removed}
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          title={removeDisabled ? (removeDisabledReason ?? undefined) : undefined}
          className="transition-smooth shrink-0 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.appCard.remove}
        </button>
      )}
    </article>
  )
}

export default AppCard
