---
description: 'ReactJS development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# ReactJS Development Instructions

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev.

## Project Context

- React 19+ with **Next.js 15 App Router** and **Turbopack**
- **TypeScript** with strict mode for type safety
- Functional components with hooks as default
- Follow React's official style guide and best practices
- Implement proper component composition and reusability patterns

## Development Standards

### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Use **modules pattern** — thin `src/app/` pages that delegate rendering to `src/modules/<Feature>/` components. Modules may contain a `components/` subfolder for **module-scoped sub-components** that are only used within that module.
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration

- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Use `FC` from React for typed functional components; use `FCC<P>` (custom alias from `@/core/types/common.type`) for components that accept `children`
- Create union types for component variants and states

### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions (PascalCase for components, camelCase for functions)
- Implement proper prop validation with TypeScript interfaces
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)
- Use **CVA** (`class-variance-authority`) for variant-based component styling
- Use **`cn()`** helper (clsx + tailwind-merge) for class merging

### State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Use **Zustand** for global client state management
- Implement proper state normalization and data structures
- Use **React Query** (`@tanstack/react-query`) for server state management

### Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic (placed in `src/hooks/`)
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values

### Styling

- Use **Tailwind CSS v4** with design tokens defined as CSS custom properties in `globals.css`
- Use `@theme` and `@theme inline` directives for Tailwind token registration
- Use the project's design tokens (e.g., `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `ring`) instead of raw color values — tokens follow shadcn/ui convention with `-foreground` suffix variants
- Font: **Roboto** (`var(--font-roboto)`) — loaded via `src/assets/fonts/fonts.css`
- Implement responsive design with mobile-first approach using Tailwind breakpoints
- Use CSS custom properties (variables) for theming
- Ensure accessibility with proper ARIA attributes and semantic HTML
- Prettier auto-sorts Tailwind classes via `prettier-plugin-tailwindcss`

### Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

### Data Fetching

- Use **React Query** (`@tanstack/react-query`) for server state management
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies with React Query
- Handle offline scenarios and network errors gracefully
- Use **axios** with a shared instance (`@/apis/axios`) for HTTP requests

### Error Handling

- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

### Forms and Validation

- Use controlled components for form inputs
- Use **React Hook Form** with **Zod** schemas (via `@hookform/resolvers`) for form validation
- Wrap forms with `<FormWrapper>` and use `<InputField>` for controlled inputs (from `@/components/form/`)
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use debounced validation for better user experience

### Routing

- Use **Next.js App Router** for file-based routing
- Define route paths in `src/core/enums/route.enum.ts` (`RouteEnum`)
- App pages (`src/app/**/page.tsx`) should be thin wrappers — import and render the corresponding module component
- Handle route parameters and query strings properly
- Implement lazy loading for route-based code splitting
- Use proper navigation patterns and back button handling

### Testing

- Write unit tests for components using React Testing Library
- Test component behavior, not implementation details
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

### Security

- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

### Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools
- ESLint enforces `jsx-a11y` rules via `eslint-plugin-jsx-a11y`

## Implementation Process

1. Plan component architecture and data flow
2. Set up project structure with proper folder organization
3. Define TypeScript interfaces and types
4. Implement core components with proper styling using Tailwind + CVA
5. Add state management (Zustand) and data fetching logic (React Query)
6. Implement routing with Next.js App Router
7. Add form handling with React Hook Form + Zod
8. Implement error handling and loading states
9. Add testing coverage for components and functionality
10. Optimize performance and bundle size
11. Ensure accessibility compliance
12. Add documentation and code comments

## Additional Guidelines

- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies
- Document complex components and custom hooks with JSDoc
- Use **ESLint** and **Prettier** for consistent code formatting (4-space indent, single quotes, no semicolons, trailing commas)
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis

## Common Patterns

- Custom hooks for reusable logic extraction (preferred over HOCs)
- Compound components for related functionality
- Provider pattern for context-based state sharing (Zustand stores, React Query providers)
- Modules pattern — thin page wrappers delegating to feature modules
- Conditional rendering via `<Show when={condition}>` component (from `@/components/base/show`)
- Dialog pattern — full-featured modal dialogs composing `base/Dialog` primitives into self-contained modal UIs
