# Development Roadmap

goodflix project phases and planned milestones.

## Current Phase: MVP (2026-04-17)

**Status:** COMPLETE

The minimum viable product delivers core functionality: 3D mood-based movie discovery with real-time trivia streaming.

### Completed Features

- ✅ **Landing page** — Popular/trending movies in 3D carousel
- ✅ **Mood search** — Natural language vibe search (LLM-powered)
- ✅ **3D visualization** — Three.js carousel with fallback 2D grid
- ✅ **Movie modal** — TMDB metadata + poster + YouTube trailer iframe
- ✅ **Trivia streaming** — Server-Sent Events for real-time fact generation
- ✅ **Origin gate** — CORS-like validation for `/api/search*` routes
- ✅ **Accessibility** — Keyboard nav, labels, contrast ≥ 4.5:1, motion preference respected
- ✅ **Deployment** — Vercel Hobby tier with CSP & security hardening
- ✅ **LLM migration** — Switched from Google Gemini → OpenAI GPT (2026-04-17)

### MVP Constraints & Tradeoffs

| Area | Constraint | Rationale |
|------|-----------|-----------|
| **Auth** | None | User state deferred (session-only caching via TanStack) |
| **Watchlist** | None | Post-MVP; requires Postgres + NextAuth |
| **Translations** | English only | Extraction done; localization post-MVP |
| **Monitoring** | Manual alerts | Sentry/datadog deferred; Vercel dashboard + OpenAI usage limits suffice |
| **Rate limiting** | Origin gate only | Upstash Redis candidate if OpenAI costs spike |
| **Detail SEO** | Not server-rendered | `/movie/[id]` detail pages; post-MVP if needed |
| **Testing** | None | Manual e2e only; unit/integration tests post-MVP |

## Post-MVP Roadmap

### Phase 1: Stability & Monitoring (Q2 2026)

**Priority:** Medium (if cost/traffic exceed thresholds)

- [ ] **Error tracking** — Sentry integration for 500-level errors
- [ ] **LLM monitoring** — OpenAI usage dashboard + daily alerts
- [ ] **Rate limiting** — Upstash Redis if `/api/search` cost > $5/day
- [ ] **Logging** — Centralized request/response logging (Vercel + custom)

**Success criteria:**
- Alert fires when OpenAI daily cost exceeds threshold
- 99% search uptime (tracked via Vercel Analytics)
- <100ms p95 cache hit latency (vibe search repeat queries)

### Phase 2: User Persistence (Q2–Q3 2026)

**Priority:** High (user demand signal)

- [ ] **Authentication** — NextAuth.js + GitHub/Google OAuth
- [ ] **Database** — Neon Postgres for user watchlists
- [ ] **Watchlist API** — `/api/watchlist` CRUD endpoints
- [ ] **UI updates** — Save/unsave buttons on modals
- [ ] **Profile page** — View saved movies, manage account

**Dependencies:** Neon free tier or $15/mo hobby tier.

**Success criteria:**
- Users can sign in, save movies, retrieve watchlist across sessions
- <200ms p95 watchlist API latency

### Phase 3: SEO & Discovery (Q3 2026)

**Priority:** Low (traffic-dependent)

- [ ] **Server-render detail pages** — `/movie/[id]` for OpenGraph + crawlers
- [ ] **Sitemap** — Dynamic XML sitemap of popular movies
- [ ] **Meta tags** — Dynamic Open Graph images (via Vercel og)
- [ ] **Schema.org** — Movie & review schema markup

**Dependencies:** ISR (incremental static regeneration) for detail pages.

**Success criteria:**
- Google crawls detail pages
- Organic search traffic detectable in analytics

### Phase 4: Internationalization (Q3–Q4 2026)

**Priority:** Low (unless EU demand detected)

- [ ] **Complete translations** — Dutch, Chinese (Simplified/Traditional)
- [ ] **RTL support** — Arabic/Hebrew (TBD based on usage)
- [ ] **Date formatting** — Locale-aware release dates
- [ ] **Content filtering** — Regional TMDB filtering (if applicable)

**Dependencies:** Lingui extraction already done; translation work only.

**Success criteria:**
- All UI strings localized
- Non-English users can complete vibe search → trivia flow

## Known Limitations & Workarounds

| Limitation | Current Workaround | Post-MVP Solution |
|------------|-------------------|-------------------|
| No user auth | Session-only TanStack cache (lost on refresh) | NextAuth + Postgres watchlist |
| No persistent watchlist | Screenshot or bookmark poster URL | Database + UI save button |
| Mobile 3D at low resolution | Auto-downgrade to `w185` posters | WebGL optimization or 2D-first mobile layout |
| Trivia SSE timeout (20s max) | ~5 facts per request | Upgrade to Vercel Pro (30s limit) or SvelteKit edge |
| In-memory state | None; each invocation independent | Redis for cross-request state (if needed) |
| No full-text search | LLM-only mood search | Add TMDB `search/movie` fallback |
| No recommendations | Static popular/trending | Personalized recommendations (watchlist-based) post-MVP |

## Release Notes

### v0.1.0 (2026-04-17) — MVP Launch

**Features:**
- 3D carousel mood discovery
- Real-time trivia streaming (SSE)
- Origin-gated search API
- Responsive + accessible UI

**Technical:**
- Next.js 15 (App Router)
- Three.js 3D + 2D fallback
- OpenAI GPT (LLM)
- TMDB API integration
- Vercel Hobby deployment

**Known issues:**
- (none; ready for production)

### v0.2.0 (TBD) — User Accounts

**Planned:**
- NextAuth.js OAuth integration
- Postgres watchlist persistence
- Profile page

### v0.3.0 (TBD) — SEO & Detail Pages

**Planned:**
- Server-rendered `/movie/[id]`
- OpenGraph images
- Schema.org markup

## Metrics & Success Criteria

### MVP Success

- [ ] Landing page: 20+ posters render in <2s (LCP)
- [ ] Vibe search: <5s p95 (network + LLM)
- [ ] Trivia: first fact appears <3s p95
- [ ] Accessibility: Lighthouse ≥95 (enforced)
- [ ] Security: Origin gate blocks CORS mismatches
- [ ] Cost: <$10/day OpenAI + TMDB (Hobby tier)

### Post-MVP Targets

- [ ] Vibe search p95: <3s (with caching)
- [ ] Watchlist p95: <200ms (with DB)
- [ ] 99% uptime (infrastructure level)
- [ ] Organic search traffic detectable (post-SEO)

## Decision Log

### 2026-04-17: Migrate Gemini → OpenAI

**Decision:** Replace Google Gemini API with OpenAI GPT-4o-mini for LLM operations.

**Rationale:**
- Gemini API rate limits stricter; OpenAI offers better value for high-volume queries
- Structured outputs (JSON schema) more reliable in OpenAI
- Cost transparency via OpenAI dashboard

**Tradeoff:** Vercel Ed‌ge runtime requires REST-based streaming (vs gRPC); mitigated via `rest-stream.ts` wrapper.

**Rollback plan:** Tag `pre-openai-cutover` available if needed.

See `docs/project-changelog.md` for detailed migration notes.

---

## Contact & Questions

- **Questions about roadmap?** Check `docs/system-architecture.md` for technical context.
- **Bug reports?** Open issue with reproduction steps.
- **Feature requests?** File under "Post-MVP Roadmap" section above.
