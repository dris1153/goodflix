# Documentation Index

This directory contains all project documentation for goodflix.

## Quick Links

- **[System Architecture](./system-architecture.md)** — Module structure, data flow, deployment targets, performance constraints
- **[Code Standards](./code-standards.md)** — Codebase organization, file naming, coding patterns, security standards, testing & quality
- **[Deployment Guide](./deployment-guide.md)** — Environment variables, pre-deploy checklist, deployment steps, post-deploy verification
- **[Development Roadmap](./development-roadmap.md)** — MVP status, post-MVP phases, metrics, decision log
- **[Project Changelog](./project-changelog.md)** — Version history, feature releases, migration notes (e.g., Gemini → OpenAI)

## Documentation by User Role

### For New Developers

1. Start with [System Architecture](./system-architecture.md) for high-level overview
2. Read [Code Standards](./code-standards.md) for local setup & coding conventions
3. Check [Deployment Guide](./deployment-guide.md) if deploying to production

### For DevOps / Deployment

1. [Deployment Guide](./deployment-guide.md) — Environment setup, pre-deploy checklist, Vercel configuration
2. [System Architecture](./system-architecture.md) → "Deployment Targets" section for infrastructure context

### For Product / Project Management

1. [Development Roadmap](./development-roadmap.md) — MVP status, planned phases, metrics
2. [Project Changelog](./project-changelog.md) — What's shipped, migration notes, known issues
3. [System Architecture](./system-architecture.md) → "Known Limitations" section

### For Security / Code Review

1. [Code Standards](./code-standards.md) → "Security Standards" section
2. [System Architecture](./system-architecture.md) → "Safety & Security" section
3. [Deployment Guide](./deployment-guide.md) → "Pre-Deploy Checklist" for security validation

## Recent Updates

**2026-04-17** — Gemini → OpenAI migration complete.

- Updated [Deployment Guide](./deployment-guide.md) with new environment variables (`OPENAI_API_KEY`, `OPENAI_MODEL`)
- Updated [System Architecture](./system-architecture.md) with LLM module details
- Created [Project Changelog](./project-changelog.md) documenting migration
- Created [Code Standards](./code-standards.md) with LLM integration patterns
- Created [Development Roadmap](./development-roadmap.md) tracking MVP completion & post-MVP phases

See [Project Changelog](./project-changelog.md) for full migration details.

## File Structure

```
docs/
├── README.md                   # This file (index & quick links)
├── system-architecture.md      # Module structure, data flow, performance, safety
├── code-standards.md           # Organization, patterns, security, testing
├── deployment-guide.md         # Environment, checklist, steps, verification
├── development-roadmap.md      # MVP status, phases, metrics, decisions
└── project-changelog.md        # Version history & migration notes
```

## Documentation Standards

- **Format:** Markdown (`.md`) with clear headers and code examples
- **Accuracy:** All documentation verified against actual codebase (no stale docs)
- **Cross-references:** Internal links use relative paths (e.g., `./system-architecture.md`)
- **Maintenance:** Updated whenever codebase changes significantly
- **Code examples:** Actual patterns from the codebase, not pseudocode

## How to Update Documentation

When making significant code changes:

1. **After feature implementation:** Update [Development Roadmap](./development-roadmap.md) with new feature/phase status
2. **After bug fixes or migrations:** Add entry to [Project Changelog](./project-changelog.md)
3. **After architectural changes:** Update [System Architecture](./system-architecture.md) and/or [Code Standards](./code-standards.md)
4. **After deployment config changes:** Update [Deployment Guide](./deployment-guide.md)

## Common Questions

**Q: How do I deploy to Vercel?**  
A: See [Deployment Guide](./deployment-guide.md) → "Deploy Steps"

**Q: What environment variables do I need?**  
A: See [Deployment Guide](./deployment-guide.md) → "Environment Variables" table

**Q: How is the LLM integrated?**  
A: See [System Architecture](./system-architecture.md) → "Module Structure: `src/apis/llm/`"

**Q: What are the security considerations?**  
A: See [Code Standards](./code-standards.md) → "Security Standards" and [System Architecture](./system-architecture.md) → "Safety & Security"

**Q: What's the post-MVP plan?**  
A: See [Development Roadmap](./development-roadmap.md) → "Post-MVP Roadmap"

**Q: How do I add new LLM operations (not just vibe search/trivia)?**  
A: See [Code Standards](./code-standards.md) → "LLM Integration Pattern" and follow the same structure in `src/apis/llm/`

## Feedback & Updates

If documentation is outdated, missing, or confusing:

1. Open an issue with location and problem
2. Submit a PR with corrections
3. Keep documentation in sync with code (no "TODO: update" markers allowed)

---

**Last updated:** 2026-04-17  
**Next review:** After next major feature or migration
