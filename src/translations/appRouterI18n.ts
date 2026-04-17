import 'server-only'

import linguiConfig from '../../lingui.config'
import { I18n, Messages, setupI18n } from '@lingui/core'
import { DEFAULT_LOCALE, type SupportedLocale } from '@/core/constants/common.constant'

const { locales } = linguiConfig

async function loadCatalog(locale: string): Promise<Record<string, Messages>> {
    const { messages } = await import(`./locales/${locale}/messages.js`)
    return { [locale]: messages }
}

const catalogs = await Promise.all(locales.map(loadCatalog))

export const allMessages: Record<string, Messages> = catalogs.reduce((acc, oneCatalog) => {
    return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = Record<string, I18n>

export const allI18nInstances: AllI18nInstances = locales.reduce<AllI18nInstances>((acc, locale) => {
    const messages = allMessages[locale] ?? {}
    const i18n = setupI18n({
        locale,
        messages: { [locale]: messages },
    })
    return { ...acc, [locale]: i18n }
}, {})

export const getI18nInstance = (locale: SupportedLocale): I18n => {
    if (!allI18nInstances[locale]) {
        console.warn(`No i18n instance found for locale "${locale}"`)
    }
    return allI18nInstances[locale]! || allI18nInstances[DEFAULT_LOCALE]!
}
