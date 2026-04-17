import { useMutation, useQueryClient } from '@tanstack/react-query'
import useDiscoverStore from '@/stores/useDiscoverStore'
import type { SearchResponse } from '@/core/types/movie.type'

const MAX_QUERY_LENGTH = 200

/** Normalize a query + optional moodId into a stable cache key string. */
function normalizeQueryKey(query: string, moodId?: string | null): string {
    const q = query.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH)
    return moodId ? `${q}::${moodId}` : q
}

export interface VibeSearchInput {
    query: string
    moodId?: string | null
}

async function postSearch(input: VibeSearchInput): Promise<SearchResponse> {
    const trimmed = input.query.trim().slice(0, MAX_QUERY_LENGTH)
    const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: trimmed,
            ...(input.moodId ? { moodId: input.moodId } : {}),
        }),
    })
    if (!res.ok) throw new Error(`Search failed: ${res.status}`)
    return res.json() as Promise<SearchResponse>
}

/**
 * Mutation hook for /api/search.
 *
 * - Client-side: trims query + enforces 200-char cap (matches server zod).
 * - Rejects empty query (no-op guard in VibeSearchOverlay — but belt & suspenders here).
 * - Sets isSearching in store during flight.
 * - On success: seeds currentMovies + clears error.
 * - On error: sets searchError message.
 * - Stores result in queryClient under ['search', normalizedKey] for session-level cache hit.
 *   F1: No server-side LRU. This is the only cache layer for /api/search.
 */
export function useVibeSearch() {
    const queryClient = useQueryClient()
    const setCurrentMovies = useDiscoverStore((s) => s.setCurrentMovies)
    const setSearching = useDiscoverStore((s) => s.setSearching)
    const setSearchError = useDiscoverStore((s) => s.setSearchError)
    const setLastQuery = useDiscoverStore((s) => s.setLastQuery)

    return useMutation({
        mutationFn: postSearch,
        onMutate: (variables) => {
            setSearching(true)
            setSearchError(null)
            // Phase 5: store the submitted query so TriviaOverlay can request relevant facts
            setLastQuery(variables.query.trim().slice(0, 200))
        },
        onSuccess: (data, variables) => {
            // F5: respect actual count — may be < 48 depending on Gemini yield
            setCurrentMovies(data.movies)
            // Session cache: repeat same query within session skips network
            const key = normalizeQueryKey(variables.query, variables.moodId)
            queryClient.setQueryData(['search', key], data)
        },
        onError: (err: Error) => {
            setSearchError(err.message ?? 'Search failed. Please try again.')
        },
        onSettled: () => {
            setSearching(false)
        },
    })
}
