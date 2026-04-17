/**
 * Gemini API client singleton.
 * Lazy-initialized to avoid instantiation on cold-start before env is ready.
 * Server-only — never import from client components.
 */
import { GoogleGenAI } from '@google/genai'
import { getServerEnv } from '@/core/configs/env.config'

let instance: GoogleGenAI | null = null

/** Returns the shared GoogleGenAI instance (lazy singleton). */
export function getGenAI(): GoogleGenAI {
    if (!instance) {
        const { geminiApiKey } = getServerEnv()
        instance = new GoogleGenAI({ apiKey: geminiApiKey })
    }
    return instance
}
