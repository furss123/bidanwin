import { Moon, Sun } from 'lucide-react'
import { useTranslation } from '../i18n'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps): React.JSX.Element {
  const { t } = useTranslation()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? t.sidebar.themeToggle.light : t.sidebar.themeToggle.dark}
      className="transition-smooth flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>{isDark ? t.sidebar.themeToggle.light : t.sidebar.themeToggle.dark}</span>
    </button>
  )
}

export default ThemeToggle
