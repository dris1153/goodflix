'use client'
import { FC } from 'react'
import CylinderScene from '@/modules/Cylinder3D/CylinderScene'
import VibeSearchOverlay from './components/VibeSearchOverlay'
import MovieDetailModal from './components/MovieDetailModal'
import useDiscoverStore from '@/stores/useDiscoverStore'
import { usePopularMoviesSeed } from './hooks/useCurrentMovies'
import { useMoodPalette } from './hooks/useMoodPalette'

/**
 * DiscoverPage — Phase 4.
 * - Fetches popular movies on mount via usePopularMoviesSeed (seeds store, staleTime 10min).
 * - Reads movies + search state from useDiscoverStore.
 * - VibeSearchOverlay (SearchBar + MoodChips) positioned at bottom, above the 3D canvas.
 * - CylinderScene receives live moodPalette + disabled flag during atlas rebuild (F7).
 * - F4: atlas rebuild up to 2.5s — old atlas stays visible until new one ready (double-buffer in P3).
 * - F5: movies.length may be < 48 depending on Gemini yield — CylinderScene handles dynamic count.
 */
const DiscoverPage: FC = () => {
    // Seed popular movies on mount (no-op if store already populated by vibe search)
    usePopularMoviesSeed()

    const currentMovies = useDiscoverStore((s) => s.currentMovies)
    const isSearching = useDiscoverStore((s) => s.isSearching)
    const selectedMovieId = useDiscoverStore((s) => s.selectedMovieId)
    const setSelectedMovieId = useDiscoverStore((s) => s.setSelectedMovieId)

    // Active mood palette — falls back to DEFAULT_PALETTE when no mood selected
    const moodPalette = useMoodPalette()

    return (
        <main className="relative flex min-h-screen w-full flex-col bg-black text-white">
            {/* Header overlays the 3D canvas */}
            <header className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
                <h1 className="font-serif text-3xl tracking-tight">Goodflix</h1>
            </header>

            {/* Vibe search: SearchBar + MoodChips + error + loading indicator */}
            <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 pointer-events-auto w-[min(92vw,680px)]">
                <VibeSearchOverlay />
            </div>

            {/* 3D Canvas: fixed absolute inset-0 — behind all overlays */}
            <div className="fixed inset-0">
                <CylinderScene
                    movies={currentMovies}
                    moodPalette={moodPalette}
                    onSelect={setSelectedMovieId}
                    // F7: disable pointer events during search to prevent stale raycast hits
                    disabled={isSearching}
                />
            </div>

            {/* Movie detail modal — mounts once, controlled by selectedMovieId */}
            <MovieDetailModal
                movieId={selectedMovieId}
                onClose={() => setSelectedMovieId(null)}
            />
        </main>
    )
}

export default DiscoverPage
