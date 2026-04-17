/**
 * POST /api/search
 * Body: { query: string (max 200), moodId?: string }
 * Flow: LLM → TMDB match (throttled) → multi-tier pad → 48 results.
 * F1: No in-memory LRU. TanStack Query handles client-side session cache.
 * F5: Request 72 from LLM, filter confidence >= 0.6, multi-tier pad to 48.
 * Returns: { movies: Movie[], fallback: SearchFallback }
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runVibeSearch } from '@/apis/llm/vibe-search'
import { searchMovie } from '@/apis/tmdb/search'
import { getPopular, getTopRated, getUpcoming } from '@/apis/tmdb/discover'
import { schedule } from '@/apis/tmdb/throttle'
import { findMood } from '@/core/constants/mood-palettes'
import { Movie, SearchFallback } from '@/core/types/movie.type'

const bodySchema = z.object({
    query: z.string().min(1).max(200),
    moodId: z.string().optional(),
})

const TARGET = 48
const MIN_CONFIDENCE = 0.6

function dedupeById(movies: Movie[]): Movie[] {
    const seen = new Set<number>()
    return movies.filter((m) => {
        if (seen.has(m.id)) return false
        seen.add(m.id)
        return true
    })
}

export async function POST(request: NextRequest) {
    const body: unknown = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { query, moodId } = parsed.data
    const mood = findMood(moodId)
    const moodSeedQuery = mood?.seedQuery

    try {
        // Step 1: LLM titles
        const llmTitles = await runVibeSearch(query, moodSeedQuery)
        const filtered = llmTitles.filter((t) => t.confidence >= MIN_CONFIDENCE)

        // Step 2: TMDB match each title (rate-limited via throttle)
        const matchPromises = filtered.map((t) => schedule(() => searchMovie(t.title, t.year)))
        const matched = await Promise.all(matchPromises)

        let movies: Movie[] = dedupeById(matched.filter((m): m is Movie => m !== null))

        let fallback: SearchFallback = 'llm'

        // Step 3: Multi-tier pad if under target
        if (movies.length < TARGET) {
            fallback = 'partial'
            const tiers = [getPopular, getTopRated, getUpcoming]
            for (const tierFn of tiers) {
                if (movies.length >= TARGET) break
                const tier = await tierFn()
                movies = dedupeById([...movies, ...tier])
            }
        }

        return NextResponse.json({
            movies: movies.slice(0, TARGET),
            fallback,
        })
    } catch (err) {
        console.error('[/api/search] LLM error, falling back to popular:', err)
        try {
            const movies = await getPopular()
            return NextResponse.json({ movies, fallback: 'popular-fallback' satisfies SearchFallback })
        } catch (fallbackErr) {
            console.error('[/api/search] Fallback also failed:', fallbackErr)
            return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
        }
    }
}
