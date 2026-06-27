import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import {
  getTranslation,
  interpolate,
  type Locale,
  type TranslationSchema
} from '@shared/i18n'

const STORAGE_KEY = 'bidanwin-locale'

interface LanguageContextValue {
  t: TranslationSchema
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ko' || stored === 'en') return stored
  } catch {
    // localStorage unavailable
  }
  return 'ko'
}

export function LanguageProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const t = useMemo(() => getTranslation(locale), [locale])

  useEffect(() => {
    void window.api.setLocale(locale)
  }, [locale])

  const value = useMemo(() => ({ t, locale, setLocale }), [t, locale, setLocale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useTranslation must be used within LanguageProvider')
  }
  return ctx
}

export { interpolate }
