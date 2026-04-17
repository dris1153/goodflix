/**
 * GET /api/discover?list=popular|top_rated|upcoming
 * Returns up to 20 movies from the chosen TMDB list.
 * Cached via unstable_cache with explicit key parts to prevent cross-list cache collisions.
 */
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { getPopular, getTopRated, getUpcoming } from '@/apis/tmdb/discover'
import { DiscoverList } from '@/core/types/movie.type'

const listSchema = z.enum(['popular', 'top_rated', 'upcoming'])

function getListFetcher(list: DiscoverList) {
    switch (list) {
        case 'popular':
            return getPopular
        case 'top_rated':
            return getTopRated
        case 'upcoming':
            return getUpcoming
    }
}

export async function GET(request: NextRequest) {
    const list = request.nextUrl.searchParams.get('list')
    const parsed = listSchema.safeParse(list)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid list param. Must be: popular | top_rated | upcoming' },
            { status: 400 }
        )
    }

    const validList = parsed.data

    try {
        const fetchMovies = unstable_cache(
            getListFetcher(validList),
            ['discover', validList],
            { revalidate: 3600, tags: ['discover', `discover:${validList}`] }
        )

        const movies = await fetchMovies()
        return NextResponse.json({ movies })
    } catch (err) {
        console.error('[/api/discover] error:', err)
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 502 })
    }
}
