/**
 * TMDB movie search with strict title + year matching.
 * F8 fix: requires string-similarity > 0.7 AND year within ±2 if provided.
 * Drops weak matches and logs them via console.warn.
 */
import stringSimilarity from 'string-similarity'
import { Movie } from '@/core/types/movie.type'
import { getServerEnv } from '@/core/configs/env.config'
import { tmdbFetch } from './client'
import { schedule } from './throttle'

interface TmdbSearchRaw {
    id: number
    title: string
    release_date?: string
    poster_path: string | null
    backdrop_path: string | null
    overview: string
}

interface TmdbSearchResponse {
    results: TmdbSearchRaw[]
}

/** Lowercase, strip punctuation, collapse whitespace */
function normTitle(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Search for a movie by title (and optionally year).
 * Returns null if no result passes the similarity + year gate.
 */
export async function searchMovie(title: string, year?: number | null): Promise<Movie | null> {
    const { tmdbImageBase } = getServerEnv()

    const params: Record<string, string> = {
        query: title,
        language: 'en-US',
        page: '1',
    }
    if (year) params.year = String(year)

    const data = await schedule(() => tmdbFetch<TmdbSearchResponse>('/search/movie', params))

    if (!data.results.length) return null

    const normalizedQuery = normTitle(title)

    for (const result of data.results) {
        if (!result.poster_path) continue

        const resultYear = result.release_date ? parseInt(result.release_date.slice(0, 4), 10) : null
        const similarity = stringSimilarity.compareTwoStrings(normalizedQuery, normTitle(result.title))

        // Year gate: only check if both sides have a year
        const yearOk = !year || !resultYear || Math.abs(year - resultYear) <= 2

        if (similarity > 0.7 && yearOk) {
            return {
                id: result.id,
                title: result.title,
                year: resultYear,
                posterUrl: `${tmdbImageBase}/w342${result.poster_path}`,
                backdropUrl: result.backdrop_path ? `${tmdbImageBase}/w1280${result.backdrop_path}` : null,
                overview: result.overview,
            }
        }

        // Log rejected matches for debugging
        console.warn(
            JSON.stringify({
                event: 'tmdb_match_rejected',
                geminiTitle: title,
                topResult: result.title,
                similarity: similarity.toFixed(3),
                yearDelta: year && resultYear ? Math.abs(year - resultYear) : null,
            }),
        )

        // Only evaluate top result
        break
    }

    return null
}
