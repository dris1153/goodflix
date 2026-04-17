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
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
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
                            'flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-medium',
                            'backdrop-blur transition-all border',
                            isActive
                                ? 'bg-white/20 border-white/50 text-white ring-1 ring-white/40'
                                : 'bg-white/8 border-white/10 text-neutral-300 hover:bg-white/15 hover:text-white',
                            disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                        ].join(' ')}
                    >
                        {/* Palette tint swatch */}
                        <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
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
