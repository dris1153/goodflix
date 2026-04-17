/**
 * SSE trivia stream — Edge runtime.
 * GET /api/search/trivia?query=...
 * Streams up to 5 cinema trivia facts as SSE events during vibe search loading.
 *
 * F3 fixes (production-grade SSE):
 * - Flush prime :\n\n to establish connection immediately
 * - Keepalive ": ping\n\n" every 15s to prevent proxy timeout
 * - 20s hard timeout (Vercel Hobby tier — Edge max 25s, validation session 1)
 * - Abort propagation via req.signal → abortCtrl
 * - X-Accel-Buffering: no to disable nginx buffering
 * - ctrl.close() in finally to guarantee stream end
 * F13 fix: REST fetch direct — no @google/genai SDK on Edge runtime
 */
import { streamTrivia } from '@/apis/gemini/trivia'

export const runtime = 'edge'

const encoder = new TextEncoder()

export async function GET(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const query = (url.searchParams.get('query') ?? '').trim().slice(0, 200)

    if (!query) {
        return new Response('bad request', { status: 400 })
    }

    const abortCtrl = new AbortController()

    // Propagate client disconnect → abort Gemini call
    req.signal.addEventListener('abort', () => abortCtrl.abort())

    const stream = new ReadableStream({
        async start(ctrl) {
            // F3: flush prime — establishes SSE connection immediately for proxies/CDN
            ctrl.enqueue(encoder.encode(':\n\n'))

            // F3: keepalive ping every 15s to prevent proxy timeout
            const ping = setInterval(() => {
                try {
                    ctrl.enqueue(encoder.encode(': ping\n\n'))
                } catch {
                    // Stream may already be closed
                }
            }, 15_000)

            // F3: hard timeout — Vercel Hobby Edge max 25s; use 20s for headroom
            const timeout = setTimeout(() => {
                try {
                    ctrl.enqueue(encoder.encode(`event: error\ndata: {"message":"timeout"}\n\n`))
                } catch {
                    // Stream may already be closed
                }
                abortCtrl.abort()
            }, 20_000)

            try {
                let i = 0
                for await (const fact of streamTrivia(query, { signal: abortCtrl.signal })) {
                    if (abortCtrl.signal.aborted) break
                    ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ fact, index: i++ })}\n\n`))
                    if (i >= 5) break
                }
            } catch {
                // Gemini failure — emit error event, overlay hides gracefully
                try {
                    ctrl.enqueue(
                        encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'trivia unavailable' })}\n\n`),
                    )
                } catch {
                    // Stream may already be closed
                }
            } finally {
                clearInterval(ping)
                clearTimeout(timeout)
                ctrl.close()
            }
        },
        cancel() {
            abortCtrl.abort()
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
            Connection: 'keep-alive',
        },
    })
}
