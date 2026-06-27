import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './i18n'
import './index.css'

const splash = document.getElementById('splash')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
)

if (splash) {
  splash.classList.add('fade-out')
  window.setTimeout(() => splash.remove(), 200)
}
