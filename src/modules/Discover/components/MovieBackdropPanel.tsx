'use client'

import { PlayIcon } from 'lucide-react'
import TrailerEmbed from './TrailerEmbed'

interface MovieBackdropPanelProps {
    backdropUrl: string | null
    trailerKey: string | null
    movieTitle: string
    isPlaying: boolean
    onPlay: () => void
}

/**
 * Left panel of MovieDetailModal.
 * Shows backdrop image with gradient + play button, or YouTube iframe when playing.
 */
export default function MovieBackdropPanel({
    backdropUrl,
    trailerKey,
    movieTitle,
    isPlaying,
    onPlay,
}: MovieBackdropPanelProps) {
    const hasTrailer = !!trailerKey

    if (isPlaying) {
        return (
            <div className="w-full md:w-1/2 shrink-0">
                <TrailerEmbed trailerKey={trailerKey} movieTitle={movieTitle} />
            </div>
        )
    }

    const backdropSrc = backdropUrl
        ? `https://image.tmdb.org/t/p/w780${backdropUrl.startsWith('/') ? backdropUrl : `/${backdropUrl}`}`
        : null

    return (
        <div className="relative w-full md:w-1/2 shrink-0 overflow-hidden rounded-lg">
            {/* Backdrop image */}
            {backdropSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={backdropSrc}
                    alt={`${movieTitle} backdrop`}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                />
            ) : (
                <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-neutral-900">
                    <span className="text-sm text-neutral-600">{movieTitle}</span>
                </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Play button or unavailable label */}
            {hasTrailer ? (
                <button
                    onClick={onPlay}
                    aria-label={`Play trailer for ${movieTitle}`}
                    className="absolute inset-0 flex items-center justify-center group"
                >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover:bg-white/30 group-hover:scale-110">
                        <PlayIcon className="h-7 w-7 text-white translate-x-0.5" />
                    </span>
                </button>
            ) : (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="rounded bg-black/60 px-3 py-1 text-xs text-neutral-400">
                        Trailer unavailable
                    </span>
                </div>
            )}
        </div>
    )
}
