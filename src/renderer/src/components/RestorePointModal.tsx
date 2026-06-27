import { useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { RestorePointResult } from '@shared/restore'
import { useTranslation } from '../i18n'

type ModalPhase = 'prompt' | 'creating' | 'success' | 'failure'

interface RestorePointModalProps {
  open: boolean
  onCancel: () => void
  onSkip: () => void
  onContinue: () => void
  onLogWarning: (message: string) => void
}

function RestorePointModal({
  open,
  onCancel,
  onSkip,
  onContinue,
  onLogWarning
}: RestorePointModalProps): React.JSX.Element | null {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<ModalPhase>('prompt')
  const [error, setError] = useState<string | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setPhase('prompt')
      setError(null)
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current)
        advanceTimer.current = null
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && phase !== 'creating') {
        event.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, phase, onCancel])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  async function handleCreate(): Promise<void> {
    setPhase('creating')
    setError(null)

    try {
      const result: RestorePointResult = await window.api.createRestorePoint()

      if (result.warning) {
        onLogWarning(t.restorePointModal.throttleWarn)
      }

      if (result.success || result.warning) {
        setPhase('success')
        advanceTimer.current = setTimeout(() => {
          onContinue()
        }, 1500)
        return
      }

      setError(result.error ?? t.restorePointModal.createFailed)
      setPhase('failure')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setPhase('failure')
    }
  }

  if (!open) return null

  const buttonsDisabled = phase === 'creating' || phase === 'success'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-point-title"
      onClick={phase === 'prompt' ? onCancel : undefined}
    >
      <div
        className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="restore-point-title"
          className="text-lg font-semibold text-stone-900"
        >
          {t.restorePointModal.title}
        </h2>

        {phase === 'success' ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            {t.restorePointModal.success}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            {t.restorePointModal.description}
          </p>
        )}

        {phase === 'creating' && (
          <p className="mt-4 flex items-center gap-2 text-sm text-stone-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.restorePointModal.creating}
          </p>
        )}

        {phase === 'failure' && error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {phase === 'failure' ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="transition-smooth rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="transition-smooth rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {t.restorePointModal.continueAnyway}
              </button>
            </>
          ) : phase === 'prompt' ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={buttonsDisabled}
                className="transition-smooth rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={buttonsDisabled}
                className="transition-smooth rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                {t.common.skip}
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={buttonsDisabled}
                className="transition-smooth rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {t.restorePointModal.createBtn}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default RestorePointModal
