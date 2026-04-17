import { NextConfig } from 'next'

const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://image.tmdb.org",
    "font-src 'self' data:",
    "connect-src 'self' https://api.themoviedb.org https://image.tmdb.org",
    'frame-src https://www.youtube-nocookie.com',
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }],
    },
    output: 'standalone',
    eslint: {
        dirs: ['src'],
    },
    experimental: {
        swcPlugins: [['@lingui/swc-plugin', {}]],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Content-Security-Policy', value: CSP },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                ],
            },
        ]
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.po$/,
            use: {
                loader: '@lingui/loader',
            },
        })

        return config
    },
}

export default nextConfig
