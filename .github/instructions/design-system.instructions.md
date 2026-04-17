---
description: 'Design system — tokens, components, and visual conventions'
applyTo: '**/*.tsx, **/*.ts, **/*.css'
---

# Design System Instructions

Reference for design tokens, component catalog, and visual conventions used throughout the frontend.

## Design Tokens

All tokens are defined as CSS custom properties in `src/app/globals.css` under `:root` and mapped to Tailwind via `@theme inline`. Tokens follow the **shadcn/ui** convention with `-foreground` suffix variants.

### Color Palette

| Token                      | Tailwind class                | Usage                   |
| -------------------------- | ----------------------------- | ----------------------- |
| `--background`             | `bg-background`               | Page background         |
| `--foreground`             | `text-foreground`             | Primary text            |
| `--card`                   | `bg-card`                     | Card surfaces           |
| `--card-foreground`        | `text-card-foreground`        | Card text               |
| `--popover`                | `bg-popover`                  | Popover surfaces        |
| `--popover-foreground`     | `text-popover-foreground`     | Popover text            |
| `--primary`                | `bg-primary` / `text-primary` | Primary action / brand  |
| `--primary-foreground`     | `text-primary-foreground`     | Text on primary bg      |
| `--secondary`              | `bg-secondary`                | Secondary surfaces      |
| `--secondary-foreground`   | `text-secondary-foreground`   | Text on secondary bg    |
| `--muted`                  | `bg-muted`                    | Muted backgrounds       |
| `--muted-foreground`       | `text-muted-foreground`       | Muted / secondary text  |
| `--accent`                 | `bg-accent`                   | Accent highlights       |
| `--accent-foreground`      | `text-accent-foreground`      | Text on accent bg       |
| `--destructive`            | `bg-destructive`              | Error / destructive     |
| `--destructive-foreground` | `text-destructive-foreground` | Text on destructive bg  |
| `--border`                 | `border-border`               | Default borders         |
| `--input`                  | `border-input`                | Input borders           |
| `--ring`                   | `ring-ring`                   | Focus ring              |
| `--chart-1` to `--chart-5` | `bg-chart-1` etc.             | Chart / data viz colors |
| `--sidebar-*`              | `bg-sidebar` etc.             | Sidebar-specific tokens |

Colors are defined using **oklch()** color space values.

### Typography

| Role | Font family | CSS variable         | Tailwind class | Notes            |
| ---- | ----------- | -------------------- | -------------- | ---------------- |
| All  | Roboto      | `var(--font-roboto)` | `font-roboto`  | Primary typeface |

Font loaded via local font file: `src/assets/fonts/Roboto/font.css`, imported in `src/assets/fonts/fonts.css`.

### Border Radius

Base radius: `--radius: 0.625rem` (10px). Components use Tailwind radius utilities (`rounded-lg`, `rounded-md`, etc.).

## Component Catalog

All base components live in `src/components/base/` — **no barrel `index.ts`**, import each by direct path (e.g., `@/components/base/button`).

### Button (`@/components/base/button`)

CVA-powered, uses **Base UI** (`@base-ui/react/button`) as primitive.

| Variant       | Visual                                    |
| ------------- | ----------------------------------------- |
| `default`     | Solid primary bg, primary-foreground text |
| `outline`     | Border, background, hover muted           |
| `secondary`   | Secondary bg, secondary-foreground text   |
| `ghost`       | Transparent, hover muted                  |
| `destructive` | Destructive/10 bg, destructive text       |
| `link`        | Primary text, underline on hover          |

| Size      | Description  |
| --------- | ------------ |
| `default` | `h-8 px-2.5` |
| `xs`      | `h-6 px-2`   |
| `sm`      | `h-7 px-2.5` |
| `lg`      | `h-9 px-2.5` |
| `icon`    | `size-8`     |
| `icon-xs` | `size-6`     |
| `icon-sm` | `size-7`     |
| `icon-lg` | `size-9`     |

### Dialog (`@/components/base/dialog`)

Composes **Radix UI** `Dialog` primitive from `'radix-ui'`. Exports: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`. Uses `lucide-react` `XIcon` for close button.

### Select, Checkbox, Tabs, Tooltip, Popover, Switch, RadioGroup

All use **Radix UI** primitives from `'radix-ui'` unified package, customized with `cn()`.

### DropdownMenu (`@/components/base/dropdown-menu`)

Uses **Radix UI** `DropdownMenu` primitive from `'radix-ui'` unified package, customized with `cn()`.

### Container (`@/components/base/container`)

Layout wrapper with max-width and horizontal padding, auto-centered.

### Show (`@/components/base/show`)

Conditional rendering: `<Show when={condition}>{children}</Show>`.

### HStack / VStack (`@/components/base/h-stack`, `@/components/base/v-stack`)

Flexbox layout with CVA variants for `align`, `spacing`, and `justify`. Support `motion` animation via Framer Motion.

### Input, InputGroup, Textarea (`@/components/base/`)

Form input primitives with consistent styling. `InputGroup` supports addons, buttons, and text decorators.

### Table (`@/components/base/table`)

Styled table with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `TableFooter`.

### Skeleton (`@/components/base/skeleton`)

Loading placeholder component.

### Toaster (`@/components/base/toaster`)

Toast notification component using `sonner`. Uses `lucide-react` icons for status variants (success, error, warning, info).

## SVG Icons

All custom icons live in `src/assets/icons/` as inline SVG React components.

### Current Icon Inventory

| File               | Component       | Usage               |
| ------------------ | --------------- | ------------------- |
| `check.tsx`        | `CheckIcon`     | Check mark          |
| `example-icon.tsx` | `ExampleIcon`   | Example / template  |
| `fill-check.tsx`   | `FillCheckIcon` | Filled check circle |

### Icon Conventions

- **File**: `kebab-case.tsx` (prefer `-icon` suffix for new icons) → **Component**: `PascalCaseIcon`
- **Props**: `React.SVGProps<SVGSVGElement>` with `{...props}` spread on `<svg>`
- **Color**: `fill="currentColor"` — consumers use `text-*` classes
- **Size**: consumers apply `className="size-X"` (e.g., `size-4`, `size-5`)
- **Export**: **named export** per file (e.g., `export const CheckIcon = ...`), no barrel `index.ts`
- **Import**: `import { CheckIcon } from '@/assets/icons/check'`

**Note**: Base components also use `lucide-react` icons internally (e.g., `CheckIcon`, `XIcon`, `ChevronDownIcon` from `lucide-react`). Use `lucide-react` for common UI icons; create custom icons in `assets/icons/` only when needed.
