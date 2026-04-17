/**
 * Gemini trivia async generator — yields 1 cinema fact at a time.
 * F2 fix: system instruction separated; user query in contents; safetySettings on 4 categories.
 * Accumulates streaming text, splits on blank lines to yield complete facts.
 * Edge-compatible: imports only rest-stream (no Node SDK).
 */
import { streamGeminiText } from './rest-stream'

const SYSTEM_INSTRUCTION =
    'You generate obscure, fascinating, truthful trivia facts about cinema, directors, genres, ' +
    'and specific films. Each fact must be one or two sentences, standalone, and engaging. ' +
    'No numbering, no titles — just facts separated by blank lines.'

// F2: BLOCK_MEDIUM_AND_ABOVE on all 4 harm categories (plain strings for Edge compat — no SDK enum)
const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
]

export interface TriviaOptions {
    signal: AbortSignal
}

/**
 * Yields up to 5 trivia facts related to the given query.
 * Each yielded string is a complete, standalone fact.
 * Stops early if signal is aborted.
 */
export async function* streamTrivia(query: string, opts: TriviaOptions): AsyncGenerator<string> {
    const userText = `Give 5 trivia facts related to: ${query}`

    let accumulated = ''
    let factCount = 0

    for await (const chunk of streamGeminiText(userText, {
        signal: opts.signal,
        systemInstruction: SYSTEM_INSTRUCTION,
        safetySettings: SAFETY_SETTINGS,
    })) {
        if (opts.signal.aborted) return
        accumulated += chunk

        // Split on blank lines (\n\n) to extract complete facts
        let idx: number
        while ((idx = accumulated.indexOf('\n\n')) !== -1) {
            const candidate = accumulated.slice(0, idx).trim()
            accumulated = accumulated.slice(idx + 2)

            if (candidate.length > 0) {
                yield candidate
                factCount++
                if (factCount >= 5) return
            }
        }
    }

    // Yield any remaining text as the final fact
    const remaining = accumulated.trim()
    if (remaining.length > 0 && factCount < 5) {
        // May contain multiple facts separated by single newlines — emit each line as a fact
        const lines = remaining
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
        for (const line of lines) {
            yield line
            factCount++
            if (factCount >= 5) return
        }
    }
}
