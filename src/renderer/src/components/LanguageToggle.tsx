import { useTranslation } from '../i18n'
import type { Locale } from '@shared/i18n'

function LanguageToggle(): React.JSX.Element {
  const { locale, setLocale, t } = useTranslation()

  function select(next: Locale): void {
    if (next !== locale) setLocale(next)
  }

  return (
    <div
      className="flex rounded-lg border border-stone-200 p-0.5 text-xs"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => select('ko')}
        className={`transition-smooth flex-1 rounded-md px-2 py-1.5 ${
          locale === 'ko'
            ? 'bg-accent font-medium text-white'
            : 'text-stone-600 hover:bg-stone-200/70'
        }`}
      >
        {t.sidebar.language.ko}
      </button>
      <button
        type="button"
        onClick={() => select('en')}
        className={`transition-smooth flex-1 rounded-md px-2 py-1.5 ${
          locale === 'en'
            ? 'bg-accent font-medium text-white'
            : 'text-stone-600 hover:bg-stone-200/70'
        }`}
      >
        {t.sidebar.language.en}
      </button>
    </div>
  )
}

export default LanguageToggle
