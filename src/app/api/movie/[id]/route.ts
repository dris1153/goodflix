/**
 * GET /api/movie/[id]
 * Returns MovieDetail with cast (top 10) and trailer key.
 * Cached 24h via unstable_cache with explicit key ['movie', id].
 */
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getMovie } from '@/apis/tmdb/movie'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
    const { id: idParam } = await context.params
    const id = parseInt(idParam, 10)

    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'Invalid movie id' }, { status: 400 })
    }

    try {
        const fetchMovie = unstable_cache(() => getMovie(id), ['movie', String(id)], { revalidate: 86400 })

        const movie = await fetchMovie()
        return NextResponse.json(movie)
    } catch (err) {
        console.error(`[/api/movie/${id}] error:`, err)
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
}
