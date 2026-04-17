import { create } from 'zustand'
import type { Movie } from '@/core/types/movie.type'

interface DiscoverStore {
    activeMoodId: string | null
    currentMovies: Movie[]
    isSearching: boolean
    searchError: string | null
    selectedMovieId: number | null
    // Actions
    setActiveMoodId: (id: string | null) => void
    setCurrentMovies: (movies: Movie[]) => void
    setSearching: (v: boolean) => void
    setSearchError: (err: string | null) => void
    setSelectedMovieId: (id: number | null) => void
}

const useDiscoverStore = create<DiscoverStore>((set) => ({
    activeMoodId: null,
    currentMovies: [],
    isSearching: false,
    searchError: null,
    selectedMovieId: null,
    setActiveMoodId: (id) => set({ activeMoodId: id }),
    setCurrentMovies: (movies) => set({ currentMovies: movies }),
    setSearching: (v) => set({ isSearching: v }),
    setSearchError: (err) => set({ searchError: err }),
    setSelectedMovieId: (id) => set({ selectedMovieId: id }),
}))

export default useDiscoverStore
