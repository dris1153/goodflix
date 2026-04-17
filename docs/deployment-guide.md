# Deployment Guide

> Translations deferred until post-MVP per red-team scope cut (2026-04-17). English only for now.

## Target

**Vercel Hobby tier** (free).

Limits to monitor:

- Edge function duration cap: **25s** (SSE trivia timeout set to 20s).
- Edge invocations: **500K / month** — alert at 80% (400K).
- Bandwidth: **100GB / month** — TMDB posters + atlas fetches dominate.

If any quota exceeds 80%: upgrade to Pro ($20/mo) or throttle demo traffic.

## Environment Variables

Set via Vercel dashboard → Settings → Environment Variables. Never commit actual values.

| Name                  | Scope        | Description                                                              |
| --------------------- | ------------ | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL` | All          | Deployed URL (e.g., `https://goodflix.vercel.app`). Used by Origin gate. |
| `OPENAI_API_KEY`      | All (server) | OpenAI API key. https://platform.openai.com/api-keys                     |
| `OPENAI_MODEL`        | All (server) | Model alias or date-pinned snapshot (default: `gpt-4o-mini`).            |
| `TMDB_BEARER_TOKEN`   | All (server) | TMDB v4 read access token. https://www.themoviedb.org/settings/api       |
| `TMDB_IMAGE_BASE`     | Optional     | Override default `https://image.tmdb.org/t/p`.                           |

## Pre-Deploy Checklist

1. **OpenAI budget cap.** In OpenAI platform → Usage & limits, set:
    - Usage alerts at target spend.
    - Max completion tokens per request already capped server-side (512 for trivia, schema-bound for vibe search).
    - Monitor `gpt-4o-mini` spend (or alternate model via `OPENAI_MODEL` env var).
2. **TMDB token.** Verify v4 bearer token has `account.id` access via a manual `curl` to `https://api.themoviedb.org/3/movie/popular`.
3. **Bundle check.** Run `ANALYZE=true pnpm build` (once analyzer is installed post-MVP). Confirm:
    - No `OPENAI_API_KEY` / `TMDB_BEARER_TOKEN` values in any `.next/static/**` chunk.
    - `three.js` / `@react-three/*` in async chunk (dynamic-imported by `DiscoverPage`).
    - No `openai` package in any client chunk.
4. **Route runtime confirmation.**
    - `/api/search/trivia` → Edge (`export const runtime = 'edge'`).
    - All others → Node (default).
5. **Origin gate smoke-test.** `curl -X POST https://your-deploy/api/search -H 'Origin: https://evil.example' -d '{"query":"x"}'` → expect `403`.

## Deploy Steps

```bash
# Push to dev branch → preview deploy runs automatically
git push origin dev

# After QA of preview URL, promote to production
# Vercel dashboard → Deployments → "Promote to Production"
```

## Post-Deploy Verification

1. Landing page hits `GET /api/discover?list=popular` within 2s; cylinder mounts with 20+ posters.
2. Click a mood chip. Within 5s (p95), cylinder repopulates. Within 2.5s of submit, first trivia fact appears via SSE.
3. Click any poster → modal opens with TMDB details. Trailer plays via `youtube-nocookie.com` iframe.
4. DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → reload → 2D grid renders, no `<canvas>` in DOM.
5. DevTools → Console → `gl.getExtension('WEBGL_lose_context').loseContext()` → toast "3D view unavailable — showing grid." appears once.
6. `curl -X POST https://your-deploy/api/search -H 'Origin: https://evil.example' -d '{"query":"x"}'` → `403`.

## Performance Notes (Advisory, Not Ship-Blocker)

Lighthouse scores recorded as baseline — not blocking. See red-team review 2026-04-17:

- Reduced-motion grid path targets LCP < 1.5s.
- 3D path prioritizes visual fidelity over Lighthouse Performance score.
- Accessibility score ≥ 95 IS enforced (labels, contrast, focus management).

## Post-MVP Upgrade Path

| Trigger                        | Upgrade                                                  |
| ------------------------------ | -------------------------------------------------------- |
| Any Vercel quota > 80%         | Pro tier ($20/mo)                                        |
| OpenAI daily cost > threshold  | Upstash Redis-backed rate limiter (replaces Origin gate) |
| User demand for watchlist/auth | Add NextAuth + Postgres/Neon                             |
| SEO need                       | Server-render `/movie/[id]` detail pages                 |

## Known Limitations

- In-memory route-handler state (none left after red-team) — no cross-invocation memory.
- SSE trivia capped at 20s (Hobby tier). Pro would allow 30s+ for more facts.
- `/api/search` repeat cost paid once per session per query (client TanStack cache only).
- Mobile: auto-reduces atlas to `w185` on low-core-count devices. Still WebGL — not a 2D fallback unless `prefers-reduced-motion` set.
