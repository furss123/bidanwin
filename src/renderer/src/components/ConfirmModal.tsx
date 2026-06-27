import { useEffect, useRef } from 'react'
import { interpolate, useTranslation } from '../i18n'

interface ConfirmModalProps {
  open: boolean
  appNames?: string[]
  title?: string
  warning?: string
  confirmBtn?: string
  hideAppList?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const MAX_VISIBLE = 10

function ConfirmModal({
  open,
  appNames = [],
  title,
  warning,
  confirmBtn,
  hideAppList = false,
  onCancel,
  onConfirm
}: ConfirmModalProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    confirmRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        onConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  const visible = appNames.slice(0, MAX_VISIBLE)
  const overflow = appNames.length - MAX_VISIBLE
  const modalTitle = title ?? t.confirmModal.title
  const modalWarning = warning ?? t.confirmModal.warning
  const modalConfirm = confirmBtn ?? t.confirmModal.confirmBtn

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-removal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-removal-title"
          className="text-lg font-semibold text-stone-900 dark:text-stone-100"
        >
          {modalTitle}
        </h2>

        {!hideAppList && appNames.length > 0 && (
          <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm text-stone-700 dark:text-stone-300">
            {visible.map((name, index) => (
              <li key={`${name}-${index}`} className="flex items-center gap-2">
                <span className="text-stone-400">·</span>
                {name}
              </li>
            ))}
            {overflow > 0 && (
              <li className="text-stone-500 dark:text-stone-400">
                {interpolate(t.confirmModal.andMore, { n: overflow })}
              </li>
            )}
          </ul>
        )}

        <p
          className={`text-sm text-amber-800 dark:text-amber-300 ${hideAppList || appNames.length === 0 ? 'mt-4' : 'mt-4'}`}
        >
          {modalWarning}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="transition-smooth rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {t.common.cancel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="transition-smooth rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {modalConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
