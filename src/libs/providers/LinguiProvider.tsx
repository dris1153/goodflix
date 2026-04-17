'use client'

import { I18nProvider } from '@lingui/react'
import { type Messages } from '@lingui/core'
import { useLinguiInit } from '@/translations/clientI18n'

type Props = {
    children: React.ReactNode
    initialLocale: string
    initialMessages: Messages
}

export function LinguiProvider({ children, initialLocale, initialMessages }: Props) {
    const i18n = useLinguiInit(initialLocale, initialMessages)
    if (i18n) return <I18nProvider i18n={i18n}>{children}</I18nProvider>
    return <></>
}
