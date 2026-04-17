'use client'

import { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/base/dialog'
import { useMovieDetail } from '../hooks/useMovieDetail'
import MovieBackdropPanel from './MovieBackdropPanel'
import MovieMetaPanel from './MovieMetaPanel'

interface MovieDetailModalProps {
    movieId: number | null
    onClose: () => void
}

/**
 * Detail modal: fetches TMDB metadata + renders backdrop, metadata, and trailer.
 * Opens when movieId is non-null. Controlled open state via movieId.
 */
export default function MovieDetailModal({ movieId, onClose }: MovieDetailModalProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    // Reset playing state whenever a new movie is selected
    useEffect(() => {
        setIsPlaying(false)
    }, [movieId])

    const { data: movie, isLoading, isError } = useMovieDetail(movieId)

    const isOpen = movieId !== null

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="w-[90vw] max-w-4xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/95 p-0 text-white backdrop-blur"
                aria-describedby={movie ? 'movie-modal-overview' : undefined}
            >
                {/* Custom close button — top-right */}
                <button
                    onClick={onClose}
                    aria-label="Close movie detail"
                    className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white"
                >
                    <XIcon className="h-4 w-4" />
                </button>

                {/* Accessible title — visually hidden when loading */}
                <DialogTitle className="sr-only">{movie ? movie.title : 'Loading movie details'}</DialogTitle>

                <div className="flex max-h-[85vh] min-h-[360px] flex-col gap-0 overflow-hidden md:flex-row">
                    {isLoading && (
                        <div className="flex w-full items-center justify-center p-12">
                            <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
                        </div>
                    )}

                    {isError && (
                        <div className="flex w-full items-center justify-center p-12">
                            <p className="text-sm text-neutral-500">Failed to load movie details.</p>
                        </div>
                    )}

                    {movie && (
                        <>
                            {/* Left: backdrop + trailer */}
                            <div className="max-h-[85vh] shrink-0 md:w-1/2">
                                <MovieBackdropPanel
                                    backdropUrl={movie.backdropUrl}
                                    trailerKey={movie.trailerKey}
                                    movieTitle={movie.title}
                                    isPlaying={isPlaying}
                                    onPlay={() => setIsPlaying(true)}
                                />
                            </div>

                            {/* Right: metadata */}
                            <div id="movie-modal-overview" className="flex-1 overflow-y-auto p-6">
                                <MovieMetaPanel movie={movie} />
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
