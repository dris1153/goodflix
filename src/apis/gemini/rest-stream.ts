/**
 * Edge-compatible Gemini REST streaming client.
 * Uses direct fetch + ?alt=sse — no @google/genai SDK (bundles Node-only deps).
 * F13 fix: REST fetch direct, works under runtime='edge' without bundling issues.
 * F2 fix: safetySettings enforced; user text in contents (not system prompt).
 */

export interface RestStreamOptions {
    signal: AbortSignal
    systemInstruction?: string
    safetySettings?: Array<{ category: string; threshold: string }>
}

/**
 * Streams text chunks from Gemini REST API using SSE (?alt=sse).
 * Yields raw text fragments as they arrive from the model.
 */
export async function* streamGeminiText(userText: string, opts: RestStreamOptions): AsyncGenerator<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY missing')

    const body = {
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        ...(opts.systemInstruction ? { systemInstruction: { parts: [{ text: opts.systemInstruction }] } } : {}),
        safetySettings: opts.safetySettings,
        generationConfig: { temperature: 1.0, maxOutputTokens: 512 },
    }

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
            signal: opts.signal,
        },
    )

    if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`gemini ${res.status}: ${errText}`)
    }

    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader()
    let buf = ''

    while (true) {
        const { value, done } = await reader.read()
        if (done) return
        buf += value

        let idx: number
        while ((idx = buf.indexOf('\n\n')) !== -1) {
            const chunk = buf.slice(0, idx)
            buf = buf.slice(idx + 2)

            if (!chunk.startsWith('data: ')) continue
            const payload = chunk.slice(6).trim()
            if (!payload || payload === '[DONE]') continue

            try {
                const json = JSON.parse(payload)
                const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) yield text
            } catch {
                // Ignore malformed SSE chunks
            }
        }
    }
}
