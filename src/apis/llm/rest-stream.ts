/**
 * Edge-compatible OpenAI REST streaming client.
 * Uses direct fetch + SSE — no openai SDK (bundles Node-only deps).
 * Parses standard OpenAI SSE format: lines starting with "data: " terminated by "[DONE]".
 */

export interface RestStreamOptions {
    signal: AbortSignal
    systemInstruction?: string
}

/**
 * Streams text chunks from OpenAI chat completions via SSE.
 * Yields raw text fragments from `choices[0].delta.content` as they arrive.
 */
export async function* streamOpenAIText(userText: string, opts: RestStreamOptions): AsyncGenerator<string> {
    const apiKey = process.env.OPENAI_API_KEY
    // Throw in all envs — silent empty bearer causes hard-to-diagnose 401s
    if (!apiKey) throw new Error('OPENAI_API_KEY missing — set it in .env (edge runtime)')

    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

    const messages: Array<{ role: 'system' | 'user'; content: string }> = []
    if (opts.systemInstruction) messages.push({ role: 'system', content: opts.systemInstruction })
    messages.push({ role: 'user', content: userText })

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: 1.0,
            max_tokens: 512,
        }),
        signal: opts.signal,
    })

    if (!res.ok) {
        // Log body server-side, throw redacted — upstream body may include key prefix / org id
        const errText = await res.text().catch(() => '')
        console.warn(`[llm] openai ${res.status} body:`, errText)
        throw new Error(`openai ${res.status}`)
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
                const text: string | undefined = json?.choices?.[0]?.delta?.content
                if (text) yield text
            } catch {
                // Ignore malformed SSE chunks
            }
        }
    }
}
