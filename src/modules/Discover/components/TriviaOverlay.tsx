'use client'
/**
 * TriviaOverlay — displays streaming cinema trivia facts during vibe search loading.
 * - Mounts only when active === true and query is non-null.
 * - Crossfades between facts using framer-motion AnimatePresence.
 * - Shows shimmer + "Curating your vibe…" while waiting for first fact.
 * - Closes EventSource stream via useTriviaStream when active becomes false.
 */
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTriviaStream } from '../hooks/useTriviaStream'

interface TriviaOverlayProps {
    query: string | null
    active: boolean
}

export default function TriviaOverlay({ query, active }: TriviaOverlayProps) {
    const { facts, currentIndex, close } = useTriviaStream(query, active)

    // When parent signals inactive (search settled), close the stream cleanly
    useEffect(() => {
        if (!active) close()
    }, [active, close])

    // Do not render when inactive
    if (!active || !query) return null

    const currentFact = facts.length > 0 ? facts[currentIndex] : null

    return (
        <div
            className="fixed bottom-32 left-1/2 z-20 w-[min(90vw,560px)] -translate-x-1/2"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="rounded-2xl border border-white/10 bg-black/70 px-7 py-5 shadow-xl backdrop-blur-md">
                <AnimatePresence mode="wait">
                    {currentFact ? (
                        <motion.p
                            key={currentFact}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="text-center font-serif text-base leading-relaxed text-white/90 select-none"
                        >
                            {currentFact}
                        </motion.p>
                    ) : (
                        <motion.div
                            key="shimmer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-3"
                        >
                            {/* Shimmer bars */}
                            <div className="h-3 w-3/4 animate-pulse rounded bg-white/20" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-white/15" />
                            <p className="mt-1 text-sm tracking-wide text-white/50">Curating your vibe…</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fact indicator dots */}
                {facts.length > 1 && (
                    <div className="mt-4 flex justify-center gap-1.5">
                        {facts.map((_, i) => (
                            <span
                                key={i}
                                className={`block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                                    i === currentIndex ? 'bg-white/80' : 'bg-white/25'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
