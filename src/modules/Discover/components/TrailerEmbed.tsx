'use client'

// YouTube key format per TMDB / red-team F11
const YT_KEY_RE = /^[A-Za-z0-9_-]{11}$/

interface TrailerEmbedProps {
    trailerKey: string | null
    movieTitle: string
}

/**
 * Renders a YouTube Privacy-Enhanced iframe or a "Trailer unavailable" fallback.
 * Defensive key validation even though server validates (red-team F11).
 */
export default function TrailerEmbed({ trailerKey, movieTitle }: TrailerEmbedProps) {
    // Defensive regex validation — server validates too, but never trust upstream data
    const safeKey = trailerKey && YT_KEY_RE.test(trailerKey) ? trailerKey : null

    if (!safeKey) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-neutral-900">
                <p className="text-sm text-neutral-500">Trailer unavailable</p>
            </div>
        )
    }

    const src = `https://www.youtube-nocookie.com/embed/${safeKey}?autoplay=1&rel=0`

    return (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
            <iframe
                src={src}
                title={`Trailer: ${movieTitle}`}
                className="h-full w-full"
                // Red-team F11: sandbox restricts iframe capabilities
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                loading="lazy"
            />
        </div>
    )
}
