/// <reference types="vite/client" />

import type { Api } from '../../preload'

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string
}

declare global {
  interface Window {
    api: Api
  }
}

export {}
