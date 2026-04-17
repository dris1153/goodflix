/**
 * Gemini vibe/mood search — returns up to 72 movie title suggestions.
 * F2 fix: user query in `contents` (not system prompt), safetySettings on 4 categories.
 * F5 fix: requests 72 titles to survive TMDB match attrition.
 * Uses structured JSON output via responseSchema.
 * Server-only — never import from client components.
 */
import { HarmCategory, HarmBlockThreshold } from '@google/genai'
import { GeminiTitle } from '@/core/types/movie.type'
import { getGenAI } from './client'

const SYSTEM_INSTRUCTION =
    'You are a film curator. Given a user\'s vibe/mood query, return 72 distinct movie titles ' +
    'matching the vibe. Include diverse decades and international films. ' +
    'Output strictly as JSON array matching the schema.'

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

const RESPONSE_SCHEMA = {
    type: 'array' as const,
    items: {
        type: 'object' as const,
        properties: {
            title: { type: 'string' as const },
            year: { type: 'integer' as const, nullable: true },
            confidence: { type: 'number' as const },
        },
        required: ['title', 'confidence'],
    },
}

/**
 * Run a vibe/mood search via Gemini.
 * @param query - User's free-text mood/vibe query (max 200 chars enforced at route)
 * @param moodSeedQuery - Optional seed from MOOD_CHIPS to prime the model
 * @returns Up to 72 GeminiTitle entries
 */
export async function runVibeSearch(query: string, moodSeedQuery?: string): Promise<GeminiTitle[]> {
    const genai = getGenAI()

    const userText = moodSeedQuery ? `Vibe: ${moodSeedQuery}\nUser query: ${query}` : query

    const response = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
            safetySettings: SAFETY_SETTINGS,
            temperature: 0.8,
        },
    })

    const text = response.text ?? ''
    const parsed: unknown = JSON.parse(text)

    if (!Array.isArray(parsed)) {
        throw new Error('Gemini response is not an array')
    }

    return (parsed as GeminiTitle[]).slice(0, 72)
}
