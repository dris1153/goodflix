import '@/assets/fonts/fonts.css'
import type { Metadata } from 'next'
import './globals.css'
import linguiConfig from '../../lingui.config'
import AppProviders from './providers'
import { siteConfig } from '@/core/configs/site.config'

export async function generateStaticParams() {
    return linguiConfig.locales.map((lang) => ({ lang }))
}

export async function generateMetadata(): Promise<Metadata> {
    // props: PageLangParam
    // const i18n = getI18nInstance((await props.params).lang)
    return {
        title: siteConfig.title,
        description: siteConfig.description,
        keywords: siteConfig.keywords,
        assets: [siteConfig.ogImage],
        openGraph: {
            title: siteConfig.title,
            description: siteConfig.description,
            url: siteConfig.url,
            images: [siteConfig.ogImage],
            type: 'website',
        },
        twitter: {
            title: siteConfig.title,
            description: siteConfig.description,
            card: 'summary_large_image',
            images: [siteConfig.ogImage],
        },
    }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    return <AppProviders>{children}</AppProviders>
}
