import { useQuery } from '@tanstack/react-query'
import useDiscoverStore from '@/stores/useDiscoverStore'
import type { Movie } from '@/core/types/movie.type'

interface DiscoverResponse {
    movies: Movie[]
}

async function fetchPopular(): Promise<DiscoverResponse> {
    const res = await fetch('/api/discover?list=popular')
    if (!res.ok) throw new Error(`Discover fetch failed: ${res.status}`)
    return res.json() as Promise<DiscoverResponse>
}

/**
 * Fetches /api/discover?list=popular on mount and seeds the discover store.
 * Only fires when store has no movies yet (avoids re-fetch after vibe search populates store).
 * StaleTime 10min — popular list doesn't change within a session.
 */
export function useCurrentMovies() {
    const currentMovies = useDiscoverStore((s) => s.currentMovies)
    const hasMovies = currentMovies.length > 0

    return useQuery({
        queryKey: ['discover', 'popular'],
        queryFn: fetchPopular,
        staleTime: 1000 * 60 * 10,
        enabled: !hasMovies,
        select: (data) => data.movies,
    })
}

/**
 * Combined hook: triggers popular fetch, seeds store on success, returns loading state.
 * DiscoverPage uses this; reads movies from store (not query result) to avoid dual source of truth.
 */
export function usePopularMoviesSeed() {
    const setCurrentMovies = useDiscoverStore((s) => s.setCurrentMovies)
    const currentMovies = useDiscoverStore((s) => s.currentMovies)
    const hasMovies = currentMovies.length > 0

    const query = useQuery({
        queryKey: ['discover', 'popular'],
        queryFn: fetchPopular,
        staleTime: 1000 * 60 * 10,
        enabled: !hasMovies,
    })

    // Seed store when query succeeds and store is still empty
    if (query.data && !hasMovies) {
        setCurrentMovies(query.data.movies)
    }

    return {
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    }
}
