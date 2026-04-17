import { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                port: '',
                pathname: '/**',
                search: '',
            },
        ],
    },
    output: 'standalone',
    eslint: {
        dirs: ['src'],
    },
    experimental: {
        swcPlugins: [['@lingui/swc-plugin', {}]],
    },
    // i18n: {
    //     locales: linguiConfig.locales,
    //     defaultLocale: linguiConfig.sourceLocale,
    // },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.po$/,
            use: {
                loader: '@lingui/loader', // https://github.com/lingui/js-lingui/issues/1782
            },
        })

        return config
    },
}

export default nextConfig
