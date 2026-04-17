export interface Movie {
    id: number
    title: string
    year: number | null
    posterUrl: string
    backdropUrl: string | null
    overview: string
}

export interface MovieDetail extends Movie {
    tagline: string | null
    runtime: number | null
    voteAverage: number
    genres: { id: number; name: string }[]
    cast: { id: number; name: string; character: string; profileUrl: string | null }[]
    trailerKey: string | null
}

export interface TmdbVideo {
    key: string
    site: string
    type: string
    official: boolean
    name: string
}

export type DiscoverList = 'popular' | 'top_rated' | 'upcoming'

export interface MoodPalette {
    tint: [number, number, number]
    glow: [number, number, number]
    speed: number
}

export interface MoodChip {
    id: string
    label: string
    seedQuery: string
    palette: MoodPalette
}

export type SearchFallback = 'llm' | 'partial' | 'popular-fallback'

export interface SearchResponse {
    movies: Movie[]
    fallback: SearchFallback
}

export interface LlmTitle {
    title: string
    year: number | null
    confidence: number
}
