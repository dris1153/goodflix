import { formatter } from '@lingui/format-po'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './src/core/constants/common.constant'

const locales: string[] = [...SUPPORTED_LOCALES]

if (process.env.NODE_ENV !== 'production') {
    locales.push('pseudo')
}

const linguiConfig = {
    locales: locales,
    sourceLocale: DEFAULT_LOCALE,
    pseudoLocale: 'pseudo',
    fallbackLocales: {
        default: 'en',
    },
    catalogs: [
        {
            path: '<rootDir>/src/translations/locales/{locale}/messages',
            include: ['<rootDir>/src/'],
            exclude: ['**/node_modules/**', '**/__tests__/**', '**/*.test.ts'],
        },
    ],
    format: formatter({ origins: false }),
}

export default linguiConfig
