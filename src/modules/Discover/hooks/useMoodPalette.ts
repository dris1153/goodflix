import useDiscoverStore from '@/stores/useDiscoverStore'
import { findMood, DEFAULT_PALETTE } from '@/core/constants/mood-palettes'
import type { MoodPalette } from '@/core/types/movie.type'

/**
 * Returns the active MoodPalette based on store activeMoodId.
 * Falls back to DEFAULT_PALETTE when no mood is selected.
 */
export function useMoodPalette(): MoodPalette {
    const activeMoodId = useDiscoverStore((s) => s.activeMoodId)
    const mood = findMood(activeMoodId)
    return mood?.palette ?? DEFAULT_PALETTE
}
