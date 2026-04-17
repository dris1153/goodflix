/**
 * TMDB movie detail fetcher.
 * Fetches movie details with appended videos + credits in a single request.
 * Maps to MovieDetail: top 10 cast, best trailer key (YouTube, validated).
 */
import { MovieDetail, TmdbVideo } from '@/core/types/movie.type'
import { getServerEnv } from '@/core/configs/env.config'
import { tmdbFetch } from './client'
import { schedule } from './throttle'

interface TmdbCredits {
    cast: Array<{
        id: number
        name: string
        character: string
        profile_path: string | null
    }>
}

interface TmdbMovieDetailRaw {
    id: number
    title: string
    release_date?: string
    poster_path: string | null
    backdrop_path: string | null
    overview: string
    tagline: string | null
    runtime: number | null
    vote_average: number
    genres: Array<{ id: number; name: string }>
    videos: { results: TmdbVideo[] }
    credits: TmdbCredits
}

/** Regex for valid 11-char YouTube video ID */
const YT_KEY_RE = /^[A-Za-z0-9_-]{11}$/

function pickTrailerKey(videos: TmdbVideo[]): string | null {
    // Prefer official YouTube trailers
    const official = videos.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official && YT_KEY_RE.test(v.key)
    )
    if (official) return official.key

    // Fall back to any YouTube trailer
    const any = videos.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer' && YT_KEY_RE.test(v.key)
    )
    return any?.key ?? null
}

export async function getMovie(id: number): Promise<MovieDetail> {
    const { tmdbImageBase } = getServerEnv()

    const raw = await schedule(() =>
        tmdbFetch<TmdbMovieDetailRaw>(`/movie/${id}`, {
            append_to_response: 'videos,credits',
            language: 'en-US',
        })
    )

    const cast = raw.credits.cast.slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: c.profile_path ? `${tmdbImageBase}/w185${c.profile_path}` : null,
    }))

    return {
        id: raw.id,
        title: raw.title,
        year: raw.release_date ? parseInt(raw.release_date.slice(0, 4), 10) : null,
        posterUrl: raw.poster_path ? `${tmdbImageBase}/w342${raw.poster_path}` : '',
        backdropUrl: raw.backdrop_path ? `${tmdbImageBase}/w1280${raw.backdrop_path}` : null,
        overview: raw.overview,
        tagline: raw.tagline ?? null,
        runtime: raw.runtime ?? null,
        voteAverage: raw.vote_average,
        genres: raw.genres,
        cast,
        trailerKey: pickTrailerKey(raw.videos.results),
    }
}
