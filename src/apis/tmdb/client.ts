/**
 * TMDB API fetch wrapper.
 * Handles bearer auth, 5s timeout, and a single 429 retry after 1s.
 * All calls should go through the throttle wrapper in throttle.ts.
 */
import { getServerEnv } from '@/core/configs/env.config'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const { tmdbBearerToken } = getServerEnv()

    const url = new URL(`${TMDB_BASE}${path}`)
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value)
        }
    }

    const result = await fetchWithTimeout(url.toString(), tmdbBearerToken)

    if (result.status === 429) {
        // Retry once after 1s on rate-limit
        await sleep(1000)
        const retry = await fetchWithTimeout(url.toString(), tmdbBearerToken)
        if (!retry.ok) {
            throw new Error(`TMDB ${retry.status} on ${path} (after 429 retry)`)
        }
        return retry.json() as Promise<T>
    }

    if (!result.ok) {
        throw new Error(`TMDB ${result.status} on ${path}`)
    }

    return result.json() as Promise<T>
}

async function fetchWithTimeout(url: string, token: string): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
        return await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        })
    } finally {
        clearTimeout(timer)
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
