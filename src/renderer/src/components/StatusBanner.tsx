import { ShieldAlert, ShieldCheck, Info, AlertCircle } from 'lucide-react'
import type { EnvInfo } from '@shared/env'
import { useTranslation } from '../i18n'

interface StatusBannerProps {
  env: EnvInfo | null
  onRelaunchElevated: () => void
  relaunching: boolean
}

function StatusBanner({
  env,
  onRelaunchElevated,
  relaunching
}: StatusBannerProps): React.JSX.Element | null {
  const { t } = useTranslation()

  if (!env) {
    return (
      <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-500">
        {t.statusBanner.checkingEnv}
      </div>
    )
  }

  if (!env.isWindows) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t.statusBanner.previewMode}</p>
      </div>
    )
  }

  if (!env.powershellAvailable) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t.statusBanner.powershellMissing}</p>
      </div>
    )
  }

  if (!env.isAdmin) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t.statusBanner.adminRequired}</p>
        </div>
        <button
          type="button"
          onClick={onRelaunchElevated}
          disabled={relaunching}
          className="transition-smooth shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {relaunching ? t.statusBanner.relaunching : t.statusBanner.relaunch}
        </button>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-4 py-2 text-sm text-emerald-800">
      <ShieldCheck className="h-4 w-4 shrink-0" />
      <span>{t.statusBanner.adminOk}</span>
      <span className="text-emerald-600/70">· {env.windowsVersion}</span>
    </div>
  )
}

export default StatusBanner
