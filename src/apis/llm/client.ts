/**
 * OpenAI API client singleton.
 * Lazy-initialized to avoid instantiation on cold-start before env is ready.
 * Server-only — never import from client components.
 */
import OpenAI from 'openai'
import { getServerEnv } from '@/core/configs/env.config'

let instance: OpenAI | null = null

/** Returns the shared OpenAI client instance (lazy singleton). */
export function getOpenAI(): OpenAI {
    if (!instance) {
        const { openaiApiKey } = getServerEnv()
        instance = new OpenAI({ apiKey: openaiApiKey })
    }
    return instance
}
