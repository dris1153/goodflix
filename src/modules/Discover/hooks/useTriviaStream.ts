'use client'
/**
 * useTriviaStream — EventSource wrapper for SSE trivia facts.
 * F3 client fixes:
 * - Explicit es.close() in onerror, completion, and effect cleanup (prevents auto-reconnect storm)
 * - Single concurrent EventSource only — closes previous before opening new
 * - Auto-advances currentIndex every 2.5s (or when new fact arrives, whichever first)
 */
import { useEffect, useRef, useState, useCallback } from 'react'

export interface TriviaStreamState {
    facts: string[]
    currentIndex: number
    error: string | null
    close: () => void
}

const FACT_ADVANCE_INTERVAL_MS = 2500
const MAX_FACTS = 5

export function useTriviaStream(query: string | null, enabled: boolean): TriviaStreamState {
    const [facts, setFacts] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)

    // Refs for stable access inside callbacks without stale closure issues
    const esRef = useRef<EventSource | null>(null)
    const advanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const factsCountRef = useRef(0)

    const clearAdvanceTimer = useCallback(() => {
        if (advanceTimerRef.current !== null) {
            clearInterval(advanceTimerRef.current)
            advanceTimerRef.current = null
        }
    }, [])

    const closeStream = useCallback(() => {
        esRef.current?.close()
        esRef.current = null
        clearAdvanceTimer()
    }, [clearAdvanceTimer])

    // Reset state when a new stream starts
    const resetState = useCallback(() => {
        setFacts([])
        setCurrentIndex(0)
        setError(null)
        factsCountRef.current = 0
    }, [])

    // Auto-advance currentIndex on a 2.5s interval
    const startAdvanceTimer = useCallback(() => {
        clearAdvanceTimer()
        advanceTimerRef.current = setInterval(() => {
            setCurrentIndex((prev) => {
                const nextCount = factsCountRef.current
                if (nextCount === 0) return prev
                return (prev + 1) % nextCount
            })
        }, FACT_ADVANCE_INTERVAL_MS)
    }, [clearAdvanceTimer])

    useEffect(() => {
        if (!enabled || !query) {
            closeStream()
            return
        }

        // Close any existing stream before opening a new one (single concurrent EventSource)
        closeStream()
        resetState()

        const es = new EventSource(`/api/search/trivia?query=${encodeURIComponent(query)}`)
        esRef.current = es

        es.onmessage = (evt: MessageEvent<string>) => {
            try {
                const data = JSON.parse(evt.data) as { fact: string; index: number }
                if (typeof data.fact !== 'string') return

                setFacts((prev) => {
                    const updated = [...prev, data.fact]
                    factsCountRef.current = updated.length
                    // Advance to the newest fact immediately on arrival
                    setCurrentIndex(updated.length - 1)
                    return updated
                })

                // Start (or restart) the rotation timer now that we have facts
                startAdvanceTimer()

                // F3: close when all facts received — no need for auto-reconnect
                if (data.index >= MAX_FACTS - 1) {
                    es.close()
                    esRef.current = null
                }
            } catch {
                // Malformed event data — ignore
            }
        }

        es.addEventListener('error', (evt: Event) => {
            // F3: parse custom error event data if available
            const messageEvt = evt as MessageEvent<string>
            if (messageEvt.data) {
                try {
                    const parsed = JSON.parse(messageEvt.data) as { message?: string }
                    setError(parsed.message ?? 'Trivia unavailable')
                } catch {
                    setError('Trivia unavailable')
                }
            }
            // F3: explicit close — prevents EventSource auto-reconnect storm
            es.close()
            esRef.current = null
            clearAdvanceTimer()
        })

        es.onerror = () => {
            // F3: onerror for connection-level errors — close and stop
            es.close()
            esRef.current = null
            clearAdvanceTimer()
        }

        return () => {
            // Cleanup on unmount or query/enabled change
            es.close()
            esRef.current = null
            clearAdvanceTimer()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, enabled])

    return { facts, currentIndex, error, close: closeStream }
}
