# Architecture - UI Components (ui)

## Executive Summary
The UI package is a shared library of React components used across the monorepo, primarily by the `web` application. It ensures UI consistency and promotes code reuse.

## Technology Stack
- **Framework:** React
- **Language:** TypeScript
- **Tooling:** Turbo (build/gen)

## Architecture Pattern: Shared Library
The package exports components that are used as building blocks for feature-specific UI in the applications.

## Key Components
- **Button:** Reusable button component.
- **Card:** Container component for grouping content.
- **Code:** Component for displaying code snippets.

## Source Tree
- `src/`: Contains the source code for all components.
- `package.json`: Defines the exports for the package.

## Development Workflow
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint`
- **Generation:** `pnpm generate:component` (Turbo generator for new components).
