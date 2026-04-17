import { create } from 'zustand'
import type { Movie } from '@/core/types/movie.type'

interface DiscoverStore {
    activeMoodId: string | null
    currentMovies: Movie[]
    isSearching: boolean
    searchError: string | null
    selectedMovieId: number | null
    /** True when WebGL context is lost — triggers 2D grid fallback (red-team F12) */
    webglFallback: boolean
    /** Last submitted search query — used by TriviaOverlay to fetch relevant facts (Phase 5). */
    lastQuery: string | null
    // Actions
    setActiveMoodId: (id: string | null) => void
    setCurrentMovies: (movies: Movie[]) => void
    setSearching: (v: boolean) => void
    setSearchError: (err: string | null) => void
    setSelectedMovieId: (id: number | null) => void
    setWebglFallback: (v: boolean) => void
    setLastQuery: (query: string | null) => void
}

const useDiscoverStore = create<DiscoverStore>((set) => ({
    activeMoodId: null,
    currentMovies: [],
    isSearching: false,
    searchError: null,
    selectedMovieId: null,
    webglFallback: false,
    lastQuery: null,
    setActiveMoodId: (id) => set({ activeMoodId: id }),
    setCurrentMovies: (movies) => set({ currentMovies: movies }),
    setSearching: (v) => set({ isSearching: v }),
    setSearchError: (err) => set({ searchError: err }),
    setSelectedMovieId: (id) => set({ selectedMovieId: id }),
    setWebglFallback: (v) => set({ webglFallback: v }),
    setLastQuery: (query) => set({ lastQuery: query }),
}))

export default useDiscoverStore
