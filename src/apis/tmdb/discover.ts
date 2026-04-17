/**
 * TMDB discover endpoints: popular, top_rated, upcoming.
 * Normalizes raw TMDB results to Movie shape.
 * Entries without poster_path are skipped.
 */
import { Movie } from '@/core/types/movie.type'
import { getServerEnv } from '@/core/configs/env.config'
import { tmdbFetch } from './client'
import { schedule } from './throttle'

interface TmdbMovieRaw {
    id: number
    title: string
    release_date?: string
    poster_path: string | null
    backdrop_path: string | null
    overview: string
}

interface TmdbDiscoverResponse {
    results: TmdbMovieRaw[]
}

function normalizeMovie(raw: TmdbMovieRaw, imageBase: string): Movie | null {
    if (!raw.poster_path) return null
    return {
        id: raw.id,
        title: raw.title,
        year: raw.release_date ? parseInt(raw.release_date.slice(0, 4), 10) : null,
        posterUrl: `${imageBase}/w342${raw.poster_path}`,
        backdropUrl: raw.backdrop_path ? `${imageBase}/w1280${raw.backdrop_path}` : null,
        overview: raw.overview,
    }
}

async function fetchList(list: string): Promise<Movie[]> {
    const { tmdbImageBase } = getServerEnv()
    const data = await schedule(() =>
        tmdbFetch<TmdbDiscoverResponse>(`/movie/${list}`, { language: 'en-US', page: '1' })
    )
    return data.results.flatMap((r) => {
        const movie = normalizeMovie(r, tmdbImageBase)
        return movie ? [movie] : []
    })
}

export function getPopular(): Promise<Movie[]> {
    return fetchList('popular')
}

export function getTopRated(): Promise<Movie[]> {
    return fetchList('top_rated')
}

export function getUpcoming(): Promise<Movie[]> {
    return fetchList('upcoming')
}
