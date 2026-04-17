---
description: 'Next.js + Tailwind development standards and instructions'
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js, **/*.css'
---

# Next.js + Tailwind Development Instructions

Instructions for high-quality Next.js applications with Tailwind CSS styling and TypeScript.

## Project Context

- **Next.js 15** App Router with **Turbopack** dev server and `standalone` output (Docker-ready)
- **TypeScript** with strict mode for type safety
- **Tailwind CSS v4** with `@theme` / `@theme inline` directives for design token registration
- **CVA** (class-variance-authority) for component variant definitions + **tailwind-merge** via `cn()` helper
- **Radix UI** (`radix-ui` unified package) and **Base UI** (`@base-ui/react`) primitives for accessible, unstyled interactive components
- **Lingui** for internationalization (i18n) with cookie-based locale
- **pnpm** as package manager

## Development Standards

### Architecture

- App Router with server and client components
- Use React Server Components by default; add `'use client'` only when needed
- **Modules pattern** — `src/app/**/page.tsx` files are thin wrappers that delegate to `src/modules/<Feature>/` components. Modules may contain a `components/` subfolder for **module-scoped sub-components**.
- **Component organization** — `base/` (reusable primitives, **no barrel `index.ts`** — import by direct path), `layout/` (page structure, barrel-exported), `form/` (form primitives), `modules/<Feature>/components/` (module-scoped sub-components). When adding new directories (e.g., `ui/`, `dialog/`), follow the same CVA + `cn()` pattern as `base/`.
- Group routes by feature/domain
- Implement proper error boundaries
- Leverage static optimization where possible

### TypeScript

- Strict mode enabled
- Clear type definitions using interfaces
- Use `FC` from React; use `FCC<P>` (from `@/core/types/common.type`) for components with children
- Proper error handling with type guards
- **Zod** for runtime type validation (form schemas via `@hookform/resolvers`)

### Styling

- **Tailwind CSS v4** — theme tokens defined as CSS custom properties in `src/app/globals.css` under `:root`
- Map tokens to Tailwind via `@theme inline` (e.g., `--color-primary`, `--color-background`, `--color-destructive`)
- Use the project's **design tokens** (e.g., `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `ring`) instead of raw color values — tokens follow shadcn/ui convention with `-foreground` suffix variants
- Font: **Roboto** (`var(--font-roboto)`) — loaded via `src/assets/fonts/fonts.css`
- Responsive design with mobile-first approach using Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`)
- Maintain semantic HTML structure
- Prettier auto-sorts Tailwind classes via `prettier-plugin-tailwindcss`

### State Management

- **Zustand** for global client state (stores in `src/stores/`)
- **React Query** (`@tanstack/react-query`) for server state management
- React hooks (`useState`, `useReducer`) for local component state
- Proper loading and error states
- Optimistic updates where appropriate

### Data Fetching

- **React Query** hooks in `src/apis/<domain>/queries.ts` for data fetching
- **axios** shared instance (`src/apis/axios.ts`) for HTTP requests
- API response shape: `IAxiosResponse<T>` (`{ success: boolean; data: T }`)
- Route constants in `src/apis/define.ts`, query keys in `src/apis/keys.ts`
- Proper error handling and retry logic
- Cache invalidation strategies via React Query

### Security

- Input validation and sanitization
- Proper authentication checks
- CSRF protection
- Rate limiting implementation
- Secure API route handling

### Performance

- Image optimization with `next/image`
- Font: **Roboto** — loaded via local font file in `src/assets/fonts/Roboto/font.css`, imported in `src/assets/fonts/fonts.css`
- Route prefetching
- Proper code splitting
- Bundle size optimization

## Implementation Process

1. Plan component hierarchy and data flow
2. Define TypeScript interfaces and types
3. Implement server-side logic (if applicable)
4. Build client components with Tailwind + CVA styling
5. Add proper error handling
6. Implement responsive styling with Tailwind breakpoints
7. Add loading states (React Suspense / React Query)
8. Add i18n with Lingui `<Trans>` / `msg` macros
9. Write tests
