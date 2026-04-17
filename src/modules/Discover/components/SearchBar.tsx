'use client'
import { FC, useState, KeyboardEvent, FormEvent } from 'react'

interface SearchBarProps {
    onSubmit: (query: string) => void
    disabled?: boolean
    placeholder?: string
}

/**
 * Controlled search input with submit on Enter or button click.
 * - Rejects empty / whitespace-only queries.
 * - 200-char cap matches server zod schema (F2).
 * - Disabled during isSearching (F7).
 */
const SearchBar: FC<SearchBarProps> = ({
    onSubmit,
    disabled = false,
    placeholder = 'Search by vibe…',
}) => {
    const [value, setValue] = useState('')

    function handleSubmit(e?: FormEvent) {
        e?.preventDefault()
        const trimmed = value.trim()
        if (!trimmed || disabled) return
        onSubmit(trimmed)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') handleSubmit()
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 w-full"
            aria-label="Vibe search"
        >
            <input
                type="text"
                value={value}
                maxLength={200}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder}
                aria-label="Search movies by vibe"
                className={[
                    'flex-1 rounded-full bg-white/10 px-5 py-3 text-sm text-white',
                    'placeholder-neutral-500 backdrop-blur outline-none',
                    'border border-white/10 focus:border-white/30 transition-colors',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15',
                ].join(' ')}
            />
            <button
                type="submit"
                disabled={disabled || !value.trim()}
                aria-label="Submit search"
                className={[
                    'rounded-full px-5 py-3 text-sm font-medium transition-all',
                    'bg-white/15 text-white backdrop-blur border border-white/15',
                    'hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/30',
                    disabled || !value.trim() ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
            >
                Search
            </button>
        </form>
    )
}

export default SearchBar
