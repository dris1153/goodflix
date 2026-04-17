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
    const openaiApiKey = process.env.OPENAI_API_KEY
    const openaiModel = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
    const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN
    const tmdbImageBase = process.env.TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p'

    // Throw in all envs — dev silent-empty causes hard-to-diagnose 401s downstream
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY missing — set it in .env')
    if (!tmdbBearerToken) throw new Error('TMDB_BEARER_TOKEN missing — set it in .env')

    return {
        openaiApiKey,
        openaiModel,
        tmdbBearerToken,
        tmdbImageBase,
    }
}
