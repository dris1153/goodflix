'use client'
import { FC } from 'react'
import SearchBar from './SearchBar'
import MoodChips from './MoodChips'
import useDiscoverStore from '@/stores/useDiscoverStore'
import { useVibeSearch } from '../hooks/useVibeSearch'
import type { MoodChip } from '@/core/types/movie.type'

/**
 * Composes SearchBar + MoodChips + loading indicator.
 * Handles wiring between chip selection, free-text search, and store state.
 * - Chip click: sets activeMoodId + fires search with seedQuery + moodId.
 * - Text submit: clears activeMoodId + fires search with typed query only.
 * - Empty query: no-op (SearchBar already guards this).
 * - Loading: spinner visible, inputs disabled (F7).
 */
const VibeSearchOverlay: FC = () => {
    const activeMoodId = useDiscoverStore((s) => s.activeMoodId)
    const isSearching = useDiscoverStore((s) => s.isSearching)
    const searchError = useDiscoverStore((s) => s.searchError)
    const setActiveMoodId = useDiscoverStore((s) => s.setActiveMoodId)
    const { mutate } = useVibeSearch()

    function handleTextSearch(query: string) {
        // Free-text: clear mood chip selection
        setActiveMoodId(null)
        mutate({ query })
    }

    function handleChipSelect(chip: MoodChip) {
        // Toggle off if already active
        if (chip.id === activeMoodId) {
            setActiveMoodId(null)
            return
        }
        setActiveMoodId(chip.id)
        mutate({ query: chip.seedQuery, moodId: chip.id })
    }

    return (
        <div className="flex w-full max-w-2xl flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <SearchBar onSubmit={handleTextSearch} disabled={isSearching} placeholder="Search by vibe…" />
                </div>
                {/* Loading indicator — visible during atlas rebuild (F4: up to 2.5s) */}
                {isSearching && (
                    <div
                        aria-label="Searching…"
                        role="status"
                        className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white"
                    />
                )}
            </div>
            <MoodChips activeMoodId={activeMoodId} onSelect={handleChipSelect} disabled={isSearching} />
            {searchError && (
                <p role="alert" className="px-1 text-xs text-red-400/80">
                    {searchError}
                </p>
            )}
        </div>
    )
}

export default VibeSearchOverlay
