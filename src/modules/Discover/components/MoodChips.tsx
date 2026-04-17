'use client'
import { FC } from 'react'
import { MOOD_CHIPS } from '@/core/constants/mood-palettes'
import type { MoodChip } from '@/core/types/movie.type'

interface MoodChipsProps {
    activeMoodId: string | null
    onSelect: (chip: MoodChip) => void
    disabled?: boolean
}

/**
 * Horizontal scrollable row of mood chips.
 * Active chip shows ring + palette tint swatch dot.
 * Click: fires onSelect with the full MoodChip (caller triggers search with seedQuery).
 * Clicking the active chip deselects it (passes null-signal via onSelect with same chip).
 */
const MoodChips: FC<MoodChipsProps> = ({ activeMoodId, onSelect, disabled = false }) => {
    return (
        <div
            role="group"
            aria-label="Mood filters"
            className="scrollbar-none flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
        >
            {MOOD_CHIPS.map((chip) => {
                const isActive = chip.id === activeMoodId
                const [r, g, b] = chip.palette.tint
                // CSS rgb from 0-1 float values
                const tintCss = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`

                return (
                    <button
                        key={chip.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(chip)}
                        aria-pressed={isActive}
                        className={[
                            'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium',
                            'border backdrop-blur transition-all',
                            isActive
                                ? 'border-white/50 bg-white/20 text-white ring-1 ring-white/40'
                                : 'border-white/10 bg-white/8 text-neutral-300 hover:bg-white/15 hover:text-white',
                            disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                        ].join(' ')}
                    >
                        {/* Palette tint swatch */}
                        <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: tintCss, opacity: isActive ? 1 : 0.6 }}
                            aria-hidden="true"
                        />
                        {chip.label}
                    </button>
                )
            })}
        </div>
    )
}

export default MoodChips
