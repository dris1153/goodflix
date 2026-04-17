export const LOCALE_KEY = 'NEXT_LINGUI_LOCALE'

export const SUPPORTED_LOCALES = ['en', 'nl', 'zh'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'
