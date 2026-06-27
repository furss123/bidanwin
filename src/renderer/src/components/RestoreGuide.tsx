import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { CATALOG } from '@shared/catalog'
import type { BloatApp } from '@shared/types'
import { useTranslation } from '../i18n'
import CodeBlock from './CodeBlock'

const DEFAULT_APPX_REINSTALL =
  'Get-AppxPackage -AllUsers | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}'

type Section2Source = 'session' | 'all'

interface RestoreGuideProps {
  removedIds: Set<string>
}

function CollapsibleSection({
  title,
  defaultOpen,
  children
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <section className="rounded-xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transition-smooth flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-stone-900"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {title}
      </button>
      {open && <div className="border-t border-stone-200 px-4 py-4">{children}</div>}
    </section>
  )
}

function isStoreLink(hint: string): boolean {
  const lower = hint.toLowerCase()
  return lower.includes('ms-windows-store') || lower.includes('microsoft store')
}

function RemovedAppRow({ app }: { app: BloatApp }): React.JSX.Element {
  const { t } = useTranslation()
  const hint = app.reinstallHint ?? t.restoreGuide.reinstallHintDefault
  const showStoreButton = isStoreLink(hint)

  return (
    <li className="rounded-lg border border-stone-200 p-3">
      <p className="font-medium text-stone-900">{app.name}</p>
      <p className="mt-1 text-sm text-stone-500">{hint}</p>
      {showStoreButton && (
        <button
          type="button"
          onClick={() => void window.api.openMicrosoftStore()}
          className="transition-smooth mt-2 inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-50"
        >
          <ExternalLink className="h-3 w-3" />
          {t.restoreGuide.openStoreShort}
        </button>
      )}
      {app.removalMethod === 'appx' && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-stone-500">
            {t.restoreGuide.perAppReinstall}
          </p>
          <CodeBlock
            code={`Get-AppxPackage -AllUsers ${app.packagePatterns[0] ?? '*'} | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}`}
          />
        </div>
      )}
    </li>
  )
}

function RestoreGuide({ removedIds }: RestoreGuideProps): React.JSX.Element {
  const { t } = useTranslation()
  const [section2Source, setSection2Source] = useState<Section2Source>('session')
  const [historyAppIds, setHistoryAppIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    window.api
      .getHistory()
      .then((file) => {
        const ids = new Set<string>()
        for (const session of file.sessions) {
          for (const app of session.apps) {
            if (app.status === 'succeeded') {
              ids.add(app.appId)
            }
          }
        }
        setHistoryAppIds(ids)
      })
      .catch(() => {
        setHistoryAppIds(new Set())
      })
  }, [])

  useEffect(() => {
    const unsub = window.api.onRemovalDone((result) => {
      setHistoryAppIds((prev) => {
        const next = new Set(prev)
        for (const id of result.succeeded) {
          next.add(id)
        }
        return next
      })
    })
    return unsub
  }, [])

  const sessionApps = useMemo(
    () => CATALOG.filter((app) => removedIds.has(app.id)),
    [removedIds]
  )

  const allHistoryApps = useMemo(
    () => CATALOG.filter((app) => historyAppIds.has(app.id)),
    [historyAppIds]
  )

  const section2Apps = section2Source === 'session' ? sessionApps : allHistoryApps
  const section2EmptyMessage =
    section2Source === 'session'
      ? t.restoreGuide.noRemovedApps
      : t.restoreGuide.noRemovedAppsAll

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-stone-900">
          {t.restoreGuide.title}
        </h1>
        <p className="text-sm text-stone-500">{t.restoreGuide.subtitle}</p>
      </header>

      <CollapsibleSection title={t.restoreGuide.section1Title} defaultOpen>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">
          {t.restoreGuide.section1Steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => void window.api.openSystemRestore()}
          className="transition-smooth mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <ExternalLink className="h-4 w-4" />
          {t.restoreGuide.openSystemRestore}
        </button>
      </CollapsibleSection>

      <CollapsibleSection title={t.restoreGuide.section2Title}>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setSection2Source('session')}
            className={`transition-smooth rounded-full px-3 py-1 text-xs font-medium ${
              section2Source === 'session'
                ? 'bg-accent text-white'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            {t.restoreGuide.sessionTab}
          </button>
          <button
            type="button"
            onClick={() => setSection2Source('all')}
            className={`transition-smooth rounded-full px-3 py-1 text-xs font-medium ${
              section2Source === 'all'
                ? 'bg-accent text-white'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            {t.restoreGuide.allSessionsTab}
          </button>
        </div>

        {section2Apps.length === 0 ? (
          <p className="text-sm text-stone-500">{section2EmptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {section2Apps.map((app) => (
              <RemovedAppRow key={app.id} app={app} />
            ))}
          </ul>
        )}
        <div className="mt-4">
          <p className="mb-2 text-sm text-stone-600">{t.restoreGuide.reinstallAll}</p>
          <CodeBlock code={DEFAULT_APPX_REINSTALL} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.restoreGuide.section3Title}>
        <p className="text-sm text-stone-700">{t.restoreGuide.section3Body}</p>
        <button
          type="button"
          onClick={() => void window.api.openMicrosoftStore()}
          className="transition-smooth mt-4 inline-flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
        >
          <ExternalLink className="h-4 w-4" />
          {t.restoreGuide.openStore}
        </button>
      </CollapsibleSection>
    </div>
  )
}

export default RestoreGuide
