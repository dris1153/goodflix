export const envConfig = {
    isProduction: process.env.NODE_ENV === 'production',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
}

/**
 * Server-only env accessor. Throws at call site if missing in production.
 * Never read these on the client — names have no NEXT_PUBLIC_ prefix.
 */
export function getServerEnv() {
    const geminiApiKey = process.env.GEMINI_API_KEY
    const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN
    const tmdbImageBase = process.env.TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p'

    if (envConfig.isProduction) {
        if (!geminiApiKey) throw new Error('GEMINI_API_KEY missing')
        if (!tmdbBearerToken) throw new Error('TMDB_BEARER_TOKEN missing')
    }

    return {
        geminiApiKey: geminiApiKey ?? '',
        tmdbBearerToken: tmdbBearerToken ?? '',
        tmdbImageBase,
    }
}
