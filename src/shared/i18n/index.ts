export type { Locale, TranslationSchema } from './types'
export { ko } from './ko'
export { en } from './en'

import { en } from './en'
import { ko } from './ko'
import type { Locale } from './types'

export const translations = { ko, en } as const

export function getTranslation(locale: Locale) {
  return translations[locale]
}

/** Replace `{key}` placeholders in a template string. */
export function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`))
}
