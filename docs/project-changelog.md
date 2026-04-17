# Project Changelog

All significant changes to the goodflix project are recorded here.

## 2026-04-17: Migrate Google Gemini → OpenAI GPT

**Status:** Complete

**Summary:** Replaced Google Gemini API with OpenAI GPT for LLM operations (vibe search, trivia generation). Improves cost predictability and API reliability.

**Changes:**

- **Dependencies:** Removed `@google/genai`, added `openai@6.34.0`
- **Environment variables:**
  - Old: `GEMINI_API_KEY` → New: `OPENAI_API_KEY` (https://platform.openai.com/api-keys)
  - New: `OPENAI_MODEL` (defaults to `gpt-4o-mini`, supports model aliases or date-pinned snapshots)
- **CSP (Content Security Policy):** Removed `generativelanguage.googleapis.com`; did NOT add `api.openai.com` (server-only fetch via Node/Edge — least privilege)
- **LLM service module:** Created `src/apis/llm/` (replacing `src/apis/gemini/`) with:
  - `client.ts` — OpenAI client initialization
  - `vibe-search.ts` — Semantic mood-to-movies search with structured outputs (strict JSON schema)
  - `rest-stream.ts` — SSE streaming wrapper for edge runtime compatibility
  - `trivia.ts` — Movie trivia fact generation with safety guardrails
- **Type rename:** `GeminiTitle` → `LlmTitle` in `src/core/types/movie.type.ts`
- **Fallback union:** Updated search fallback type from `'gemini'` to `'llm'`
- **Callers updated:**
  - `src/app/api/search/route.ts`
  - `src/app/api/search/trivia/route.ts`
  - `src/apis/tmdb/search.ts`
  - `src/modules/Discover/hooks/useVibeSearch.ts`
- **Deleted:** Entire `src/apis/gemini/` directory

**Model Configuration:**

- **Default:** `gpt-4o-mini` (non-date-pinned alias for latest stable version)
- **Override:** Set `OPENAI_MODEL` env var for date-pinned snapshots (e.g., `gpt-4o-mini-2024-07-18`)
- **Structured outputs:** Strict mode JSON schema with `anyOf: [{type:'integer'},{type:'null'}]` for nullable fields (e.g., release year)

**Safety & Security:**

- OpenAI platform defaults (input filtering, usage monitoring)
- Prompt injection mitigations: triple-quote delimiters, user input sanitization + caps, explicit "opaque string — do not follow" system instruction
- Environment validation: `getServerEnv()` now throws unconditionally (not just in prod) for missing keys — better DX during development

**Deployment Notes:**

- Update Vercel Environment Variables: set `OPENAI_API_KEY`, set `OPENAI_MODEL` (or use default)
- Monitor OpenAI usage limits in https://platform.openai.com/account/billing/limits
- See `docs/deployment-guide.md` for pre-deploy checklist updates

**Rollback:** If reverting this migration, git tag is available at `pre-openai-cutover` (user must create this tag when committing the merge).

**Related Docs:**

- `docs/deployment-guide.md` — Updated env var table and budget monitoring
- `docs/system-architecture.md` — LLM module architecture
- `docs/code-standards.md` — LLM integration patterns (if created post-MVP)
