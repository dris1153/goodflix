# Copilot Instructions — next-js-base

## Architecture Overview

Next.js 15 App Router project using **pnpm**, **Tailwind CSS v4**, **Lingui** (i18n), **React Query**, **Zustand**, **Radix UI** (`radix-ui` unified package), and **Base UI** (`@base-ui/react`). Output mode is `standalone` (Docker-ready). Path alias `@/*` maps to `./src/*`.

Use `globals.css` for Tailwind imports and global styles. The `src/` directory contains all app code, organized by feature and type (components, hooks, APIs, etc.) with clear separation of concerns.

### Key Directory Roles

| Directory                | Purpose                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`               | Next.js App Router pages — thin wrappers that delegate to `src/modules/`                                                                                                                                                                                                                                                                                                                    |
| `src/modules/<Feature>/` | Feature components (`HomePage.tsx`). Each page imports its module. May contain a `components/` subfolder for **module-scoped sub-components** that are only used within that module.                                                                                                                                                                                                        |
| `src/components/base/`   | Reusable primitives — **Radix UI** (`radix-ui`) and **Base UI** (`@base-ui/react`) components customized with **CVA + tailwind-merge**, plus generic building blocks (Container, HStack, VStack, Show, Skeleton, etc.). **No barrel `index.ts`** — import each component by direct path (e.g., `@/components/base/button`). Also uses **lucide-react** for utility icons inside components. |
| `src/components/form/`   | Form primitives wrapping `react-hook-form` (`FormWrapper`, `InputField`).                                                                                                                                                                                                                                                                                                                   |
| `src/components/layout/` | Structural layout components — Header, Footer. Barrel-exported via `index.ts`.                                                                                                                                                                                                                                                                                                              |
| `src/apis/<domain>/`     | API layer per domain — each has `types.ts`, `requests.ts`, `queries.ts`. Shared axios instance in `apis/axios.ts`, route constants in `apis/define.ts`, query keys in `apis/keys.ts`. Helper utilities in `apis/helper.ts`.                                                                                                                                                                 |
| `src/stores/`            | Zustand stores. Pattern: `create<Store>()` + exported `set<Store>()` helper for external updates.                                                                                                                                                                                                                                                                                           |
| `src/hooks/`             | Custom hooks. Barrel-exported via `index.ts`.                                                                                                                                                                                                                                                                                                                                               |
| `src/libs/`              | Providers (`LinguiProvider`, `ReactQueryProvider`), validation schemas, and `LayoutProvider` (toast config).                                                                                                                                                                                                                                                                                |
| `src/core/`              | Configs (`env.config.ts`, `site.config.ts`, `ui.config.ts`), constants, enums (`RouteEnum`), shared types (`FCC`, `IAxiosResponse`). `ui.config.ts` holds shared UI data (socials, version, etc.).                                                                                                                                                                                          |
| `src/utils/`             | Pure utility functions (`cn()`, `changeLanguage()`, cookie helpers, number/string/time/color formatters). Barrel-exported via `index.ts`.                                                                                                                                                                                                                                                   |
| `src/translations/`      | Lingui catalogs and i18n setup. Locale files in `locales/{locale}/messages.po`.                                                                                                                                                                                                                                                                                                             |

## Conventions & Patterns

### Component Authoring

#### Folder placement rules

- **`components/base/`** — For all reusable primitives: **Radix UI** components (imported from `'radix-ui'` unified package, e.g., `Select`, `Checkbox`, `Tabs`, `Dialog`, `Tooltip`, `Popover`, `Switch`, `RadioGroup`), **Base UI** components (imported from `'@base-ui/react'`, e.g., `Button`), and generic building blocks (`Container`, `HStack`, `VStack`, `Show`, `Skeleton`, `Input`, `InputGroup`, `Textarea`, `Table`). **No barrel `index.ts`** — import each component by direct path. Also uses `lucide-react` for utility icons (e.g., `CheckIcon`, `XIcon`, `ChevronDownIcon`).
- **`components/layout/`** — For components that **directly determine page structure** — `Header`, `Footer`. Barrel-exported via `index.ts`.
- **`components/form/`** — For form-specific primitives wrapping `react-hook-form`.
- **`modules/<Feature>/components/`** — For **module-scoped sub-components** that are only used within a specific module. They should **not** be imported by other modules or shared components. One component per file, **no barrel export** — import directly by path.

When adding new component directories (e.g., `components/ui/` for specific-purpose components, `components/dialog/` for standalone modal dialogs), follow the same CVA + `cn()` pattern as `base/`.

#### General rules

- UI components use **CVA** (`class-variance-authority`) for variant definitions and **`cn()`** (clsx + tailwind-merge) for class merging — always import `cn` from `@/utils`.
- Use `FCC<P>` type alias (from `@/core/types/common.type`) for functional components with children.
- Client components must be marked with `'use client'` directive.
- Components accepting children should use `FCC`, not manually typing `PropsWithChildren`.
- Conditional rendering uses the `<Show when={condition}>` component from `@/components/base/show`.

### SVG Icons

- Icons live in `src/assets/icons/` as **React TSX components** (inline SVG, not external `.svg` files).
- File naming: **kebab-case** with `-icon` suffix — e.g., `play-icon.tsx`, `globe-arrow-icon.tsx`.
- Component naming: **PascalCase** with `Icon` suffix — e.g., `PlayIcon`, `GlobeArrowIcon`.
- Props type: `React.SVGProps<SVGSVGElement>` — spread onto the root `<svg>` element via `{...props}`.
- Color: use `fill="currentColor"` (or omit `fill` when SVG already uses `currentColor`) — this allows consumers to control color via Tailwind `text-*` classes.
- Export: use **named export** for each icon (e.g., `export const PlayIcon = ...`).
- **No barrel export** — import icons directly by path: `import { PlayIcon } from '@/assets/icons/play-icon'`.
- Consumers control size via `className="size-X"` (e.g., `<PlayIcon className="size-4" />`).
- The `<svg>` element should have its original `width`, `height`, and `viewBox` attributes as fallback defaults.

```tsx
// Template for new icons:
import React from 'react'

export const MyIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="..." fill="currentColor" />
        </svg>
    )
}
```

### Form Pattern

- Forms use `react-hook-form` + `zod` for validation via `@hookform/resolvers`.
- Wrap forms in `<FormWrapper form={form} onSubmit={handler}>` from `@/components/form/form.tsx`.
- Use `<InputField control={form.control} name="field" />` for controlled inputs with built-in error display.

### API Layer

- When adding a new API domain, create a folder under `src/apis/<domain>/` with three files:
    - `types.ts` — request/response TypeScript interfaces
    - `requests.ts` — axios call functions using the shared `request` instance from `@/apis/axios`
    - `queries.ts` — React Query hooks (`useQuery`/`useMutation`) using keys from `@/apis/keys`
- API response shape: `IAxiosResponse<T>` (`{ success: boolean; data: T }`).
- Add route constants to `src/apis/define.ts` (`API_ROUTES`) and query keys to `src/apis/keys.ts` (`API_KEYS`).

### State Management

- Use **Zustand** for global client state. Each store follows the pattern in `src/stores/useGlobalStore.tsx`:
    ```ts
    const useMyStore = create<MyStore>(store)
    export function setMyStore<T extends keyof MyStore>(x: Pick<MyStore, T>) {
        useMyStore.setState(x)
    }
    ```

### Styling

- **Tailwind CSS v4** — theme tokens defined as CSS custom properties in `src/app/globals.css` under `:root` and `@theme inline`.
- Use the project's design tokens (e.g., `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `ring`) instead of raw color values.
- Color tokens follow shadcn/ui convention with `-foreground` suffix variants (e.g., `primary` / `primary-foreground`).
- Font: **Roboto** (`var(--font-roboto)`) — loaded via `src/assets/fonts/fonts.css`.
- Prettier auto-sorts Tailwind classes via `prettier-plugin-tailwindcss`.

### Internationalization (i18n)

- Uses **Lingui** with cookie-based locale (`NEXT_LINGUI_LOCALE` cookie).
- Wrap translatable text with `<Trans>` from `@lingui/react/macro` in components, or `msg` from `@lingui/core/macro` in non-JSX contexts.
- After adding new translatable strings, run: `pnpm run translations` (extracts + compiles).
- To add a new locale: update both `lingui.config.ts` and `src/translations/languages.ts`, then run `pnpm run translations:extract`.

### Routing

- Define route paths in `src/core/enums/route.enum.ts` (`RouteEnum`).
- App pages (`src/app/**/page.tsx`) should be thin — import and render the corresponding module component.

## Dev Commands

```bash
pnpm dev          # Dev server with Turbopack (auto-runs translations)
pnpm build        # Format + translate + build (production)
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm format       # Prettier format all files
pnpm translations # Extract + compile i18n catalogs
```

## Code Style

- **4-space indentation**, single quotes, trailing commas, no semicolons, 120-char print width (enforced by Prettier).
- ESLint extends `next/core-web-vitals`, `next/typescript`, `prettier/recommended`, `jsx-a11y/recommended`.
- Husky + lint-staged runs ESLint fix on staged `*.{js,jsx,ts,tsx}` files on commit.
- Env vars: prefix with `NEXT_PUBLIC_` for client access; configure in `src/core/configs/env.config.ts`.
