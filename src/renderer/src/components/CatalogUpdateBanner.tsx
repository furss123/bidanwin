import { Sparkles } from 'lucide-react'
import type { CatalogUpdateResult } from '@shared/catalogUpdate'
import { interpolate, useTranslation } from '../i18n'

interface CatalogUpdateBannerProps {
  updateResult: CatalogUpdateResult
  onViewNew: () => void
  onDismiss: () => void
}

const CHANGELOG_MAX = 120

function CatalogUpdateBanner({
  updateResult,
  onViewNew,
  onDismiss
}: CatalogUpdateBannerProps): React.JSX.Element {
  const { t } = useTranslation()
  const changelog = updateResult.changelog ?? ''
  const truncated =
    changelog.length > CHANGELOG_MAX ? `${changelog.slice(0, CHANGELOG_MAX)}…` : changelog

  return (
    <div className="mb-4 rounded-lg border border-accent/30 bg-accent-muted px-4 py-3 dark:border-accent/40 dark:bg-accent/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {t.catalogUpdate.navBanner} —{' '}
              {interpolate(t.catalogUpdate.newApps, { n: updateResult.newApps.length })}
            </p>
            {updateResult.remoteVersion && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                v{updateResult.remoteVersion}
              </span>
            )}
          </div>
          {truncated && (
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
              <span className="font-medium">{t.catalogUpdate.changelog}:</span> {truncated}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onViewNew}
            className="transition-smooth rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {t.catalogUpdate.viewNew}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="transition-smooth rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {t.catalogUpdate.dismiss}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CatalogUpdateBanner
