'use client'

import { useState } from 'react'
import type { MovieDetail } from '@/core/types/movie.type'

interface MovieMetaPanelProps {
    movie: MovieDetail
}

const OVERVIEW_LIMIT = 200

/**
 * Right panel of MovieDetailModal: title, meta row, tagline, overview, cast.
 */
export default function MovieMetaPanel({ movie }: MovieMetaPanelProps) {
    const [overviewExpanded, setOverviewExpanded] = useState(false)

    const { title, year, runtime, voteAverage, genres, tagline, overview, cast } = movie

    const ratingLabel = voteAverage > 0 ? `★ ${voteAverage.toFixed(1)}` : null
    const runtimeLabel = runtime ? `${runtime} min` : null

    // Top 5 cast members
    const topCast = cast.slice(0, 5)

    const isLongOverview = overview.length > OVERVIEW_LIMIT
    const displayedOverview =
        isLongOverview && !overviewExpanded ? `${overview.slice(0, OVERVIEW_LIMIT)}…` : overview

    return (
        <div className="flex flex-col gap-4 overflow-y-auto md:w-1/2">
            {/* Title */}
            <h2 className="font-serif text-2xl font-bold leading-tight text-white md:text-3xl">{title}</h2>

            {/* Meta row: year · runtime · rating */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
                {year && <span>{year}</span>}
                {runtimeLabel && (
                    <>
                        <span className="text-neutral-700">·</span>
                        <span>{runtimeLabel}</span>
                    </>
                )}
                {ratingLabel && (
                    <>
                        <span className="text-neutral-700">·</span>
                        <span className="text-yellow-400">{ratingLabel}</span>
                    </>
                )}
            </div>

            {/* Genre chips */}
            {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                        <span
                            key={g.id}
                            className="rounded-full border border-neutral-700 px-3 py-0.5 text-xs text-neutral-300"
                        >
                            {g.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Tagline */}
            {tagline && (
                <p className="italic text-sm text-neutral-400 leading-relaxed">{tagline}</p>
            )}

            {/* Overview */}
            {overview && (
                <div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{displayedOverview}</p>
                    {isLongOverview && (
                        <button
                            onClick={() => setOverviewExpanded((v) => !v)}
                            className="mt-1 text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-300"
                        >
                            {overviewExpanded ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </div>
            )}

            {/* Cast row — top 5 */}
            {topCast.length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-600">Cast</p>
                    <div className="flex flex-wrap gap-3">
                        {topCast.map((member) => (
                            <div key={member.id} className="flex flex-col items-center gap-1 w-14">
                                {/* Avatar: profile image or initials circle */}
                                {member.profileUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${member.profileUrl.startsWith('/') ? member.profileUrl : `/${member.profileUrl}`}`}
                                        alt={member.name}
                                        crossOrigin="anonymous"
                                        className="h-12 w-12 rounded-full object-cover ring-1 ring-neutral-700"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                                        <span className="text-sm font-medium text-neutral-400">
                                            {member.name
                                                .split(' ')
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join('')}
                                        </span>
                                    </div>
                                )}
                                <span className="w-full text-center text-[10px] leading-tight text-neutral-500 truncate">
                                    {member.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
