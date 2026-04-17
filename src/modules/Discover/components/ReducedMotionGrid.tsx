'use client'
import Image from 'next/image'
import type { Movie, MoodPalette } from '@/core/types/movie.type'

/**
 * ReducedMotionGrid — pure 2D poster grid rendered when:
 *   - User prefers-reduced-motion (OS/browser setting), OR
 *   - WebGL context has been lost at runtime (red-team F12).
 *
 * No Canvas, no atlas, no WebGL. Uses next/image for optimized lazy loading (F14).
 * Mood tint applied as a subtle overlay div (10% opacity) to avoid GPU-accelerated CSS.
 */

interface ReducedMotionGridProps {
    movies: Movie[]
    moodPalette?: MoodPalette
    onSelect: (id: number) => void
    /** Disables pointer interactions during search (mirrors CylinderScene disabled prop). */
    disabled?: boolean
}

/** Convert 0–255 RGB tuple from MoodPalette to a CSS rgb() string. */
function tintColor(tint: [number, number, number]): string {
    const [r, g, b] = tint
    return `rgb(${r}, ${g}, ${b})`
}

export default function ReducedMotionGrid({ movies, moodPalette, onSelect, disabled = false }: ReducedMotionGridProps) {
    return (
        <div className="relative min-h-screen w-full bg-black" aria-label="Movie poster grid">
            {/* Mood tint overlay — full-screen, non-interactive, 10% opacity */}
            {moodPalette && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-0 transition-colors duration-700"
                    style={{
                        backgroundColor: tintColor(moodPalette.tint),
                        opacity: 0.1,
                    }}
                />
            )}

            <ul
                className={[
                    'relative z-10',
                    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
                    'mx-auto max-w-7xl gap-3 p-6',
                    disabled ? 'pointer-events-none opacity-60' : '',
                ].join(' ')}
                aria-label="Movie posters"
            >
                {movies.map((movie) => (
                    <li key={movie.id}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelect(movie.id)}
                            className={[
                                'group relative w-full overflow-hidden rounded-md',
                                'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                                'transition-transform duration-150 ease-out',
                                'hover:scale-[1.02]',
                            ].join(' ')}
                            aria-label={`${movie.title}${movie.year ? ` (${movie.year})` : ''}`}
                        >
                            {/* Aspect ratio 2:3 (poster standard) */}
                            <div className="relative aspect-[2/3] w-full">
                                <Image
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 17vw, 12.5vw"
                                    loading="lazy"
                                    className="rounded-md object-cover"
                                />
                                {/* Hover ring overlay */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-md ring-2 ring-white/0 transition-all duration-150 group-hover:ring-white/60"
                                />
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
