'use client'
import { FC } from 'react'
import dynamic from 'next/dynamic'
import CanvasErrorBoundary from '@/modules/Cylinder3D/CanvasErrorBoundary'
import VibeSearchOverlay from './components/VibeSearchOverlay'
import MovieDetailModal from './components/MovieDetailModal'
import TriviaOverlay from './components/TriviaOverlay'
import ReducedMotionGrid from './components/ReducedMotionGrid'
import useDiscoverStore from '@/stores/useDiscoverStore'
import { usePopularMoviesSeed } from './hooks/useCurrentMovies'
import { useMoodPalette } from './hooks/useMoodPalette'
import { usePrefers2D } from './hooks/usePrefers2D'

// Phase 8: lazy-load 3D scene so reduced-motion users never pay the three.js bundle cost.
// ssr:false because R3F + WebGL have no meaningful server render.
const CylinderScene = dynamic(() => import('@/modules/Cylinder3D/CylinderScene'), {
    ssr: false,
    loading: () => null,
})

const DiscoverPage: FC = () => {
    usePopularMoviesSeed()

    const currentMovies = useDiscoverStore((s) => s.currentMovies)
    const isSearching = useDiscoverStore((s) => s.isSearching)
    const selectedMovieId = useDiscoverStore((s) => s.selectedMovieId)
    const setSelectedMovieId = useDiscoverStore((s) => s.setSelectedMovieId)
    const lastQuery = useDiscoverStore((s) => s.lastQuery)

    const moodPalette = useMoodPalette()
    const prefers2D = usePrefers2D()

    return (
        <main className="relative flex min-h-screen w-full flex-col bg-black text-white">
            <header className="pointer-events-none absolute top-0 right-0 left-0 z-10 p-6">
                <h1 className="font-serif text-3xl tracking-tight">Goodflix</h1>
            </header>

            <div className="pointer-events-auto absolute bottom-8 left-1/2 z-10 w-[min(92vw,680px)] -translate-x-1/2">
                <VibeSearchOverlay />
            </div>

            <TriviaOverlay query={lastQuery} active={isSearching} />

            {prefers2D ? (
                <div className="fixed inset-0 overflow-y-auto pt-20 pb-32">
                    <ReducedMotionGrid
                        movies={currentMovies}
                        moodPalette={moodPalette}
                        onSelect={setSelectedMovieId}
                        disabled={isSearching}
                    />
                </div>
            ) : (
                <div className="fixed inset-0">
                    <CanvasErrorBoundary>
                        <CylinderScene
                            movies={currentMovies}
                            moodPalette={moodPalette}
                            onSelect={setSelectedMovieId}
                            disabled={isSearching}
                        />
                    </CanvasErrorBoundary>
                </div>
            )}

            <MovieDetailModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
        </main>
    )
}

export default DiscoverPage
