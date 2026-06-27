import type { EnvInfo } from '@shared/env'
import { CATALOG_VERSION } from '@shared/catalog'
import type { CatalogUpdateResult } from '@shared/catalogUpdate'
import type { OemDetectionResult } from '@shared/oemCatalog'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { interpolate, useTranslation } from '../i18n'

interface AboutScreenProps {
  env: EnvInfo | null
  oemDetectionResult: OemDetectionResult | null
  onCatalogUpdate?: (result: CatalogUpdateResult) => void
}

function formatCheckTime(timestamp: number | undefined, locale: string): string {
  if (!timestamp) return '—'
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

function AboutScreen({ env, oemDetectionResult, onCatalogUpdate }: AboutScreenProps): React.JSX.Element {
  const { t, locale } = useTranslation()
  const version = import.meta.env.VITE_APP_VERSION ?? '0.0.0'
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<CatalogUpdateResult | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState<number | undefined>()

  useEffect(() => {
    void window.api.getLastCatalogUpdateResult().then((result) => {
      if (result) {
        setCheckResult(result)
        setLastCheckedAt(result.cacheFetchedAt)
      }
    })
  }, [])

  async function handleCheckUpdate(): Promise<void> {
    setChecking(true)
    try {
      const result = await window.api.checkCatalogUpdate(true)
      setCheckResult(result)
      setLastCheckedAt(result.cacheFetchedAt ?? Date.now())
      onCatalogUpdate?.(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setCheckResult({
        status: 'error',
        newApps: [],
        removedIds: [],
        error: message
      })
    } finally {
      setChecking(false)
    }
  }

  const statusMessage =
    checkResult?.status === 'up-to-date'
      ? t.catalogUpdate.upToDate
      : checkResult?.status === 'skipped'
        ? t.catalogUpdate.skipped
        : checkResult?.status === 'error' && checkResult.error
          ? interpolate(t.catalogUpdate.error, { error: checkResult.error })
          : checkResult?.status === 'updated' && checkResult.newApps.length > 0
            ? interpolate(t.catalogUpdate.newApps, { n: checkResult.newApps.length })
            : null

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-card">
        <img
          src="/icon.png"
          alt="BidanWin"
          className="mx-auto h-24 w-24 rounded-2xl shadow-md"
          width={96}
          height={96}
        />

        <h1 className="mt-6 text-3xl font-bold text-stone-900">
          {t.aboutScreen.title}
        </h1>
        <p className="mt-1 text-lg text-stone-500">{t.aboutScreen.subtitle}</p>
        <p className="mt-1 text-sm text-stone-400">
          {t.aboutScreen.version} {version}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          {locale === 'ko' ? t.aboutScreen.description : t.aboutScreen.descriptionEn}
        </p>

        <p className="mt-4 text-xs text-stone-500">{t.aboutScreen.copyright}</p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void window.api.openLicense()}
            className="transition-smooth text-sm text-accent hover:underline"
          >
            {t.aboutScreen.viewLicense}
          </button>
          <button
            type="button"
            onClick={() => void window.api.openExternal('https://github.com/hyot/bidanwin')}
            className="transition-smooth text-sm text-accent hover:underline"
          >
            {t.aboutScreen.github}
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-left text-xs text-stone-600">
          <p>
            <span className="text-stone-500">{t.catalogUpdate.catalogVersion}:</span> v
            {CATALOG_VERSION}
            {checkResult?.remoteVersion && checkResult.remoteVersion !== CATALOG_VERSION
              ? ` → v${checkResult.remoteVersion}`
              : ''}
          </p>
          <p className="mt-1">
            {interpolate(t.catalogUpdate.lastChecked, {
              time: formatCheckTime(lastCheckedAt, locale)
            })}
          </p>
          {env && (
            <>
              <p className="mt-1">
                <span className="text-stone-500">{t.aboutScreen.os}:</span> {env.windowsVersion}
              </p>
              <p className="mt-1">
                <span className="text-stone-500">{t.aboutScreen.adminStatus}:</span>{' '}
                {env.isAdmin ? t.aboutScreen.adminYes : t.aboutScreen.adminNo}
              </p>
            </>
          )}
          <p className="mt-1">
            {oemDetectionResult === null
              ? t.oem.detecting
              : oemDetectionResult.manufacturer === 'unknown'
                ? t.oem.unknownManufacturer
                : interpolate(t.oem.detectedAs, {
                    manufacturer: t.oem.manufacturers[oemDetectionResult.manufacturer],
                    model: oemDetectionResult.model || '—'
                  })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleCheckUpdate()}
          disabled={checking}
          className="transition-smooth mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {checking && <Loader2 className="h-4 w-4 animate-spin" />}
          {checking ? t.catalogUpdate.checking : t.catalogUpdate.checkBtn}
        </button>

        {statusMessage && (
          <p className="mt-3 text-xs text-stone-500">{statusMessage}</p>
        )}
      </div>
    </div>
  )
}

export default AboutScreen
