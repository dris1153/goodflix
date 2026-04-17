import { useQuery } from '@tanstack/react-query'
import type { MovieDetail } from '@/core/types/movie.type'

async function fetchMovieDetail(id: number): Promise<MovieDetail> {
    const res = await fetch(`/api/movie/${id}`)
    if (!res.ok) throw new Error(`Movie detail fetch failed: ${res.status}`)
    return res.json() as Promise<MovieDetail>
}

/**
 * Fetches detailed movie metadata from /api/movie/[id].
 * Enabled only when id is non-null. StaleTime 5 min — detail data is stable.
 */
export function useMovieDetail(id: number | null) {
    return useQuery({
        queryKey: ['movie', id],
        queryFn: () => fetchMovieDetail(id!),
        enabled: id !== null,
        staleTime: 5 * 60 * 1000,
    })
}
