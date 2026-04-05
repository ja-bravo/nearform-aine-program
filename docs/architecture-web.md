# Architecture - Web Frontend (web)

## Executive Summary
The Web Frontend is a Next.js application using the App Router. It serves as the primary user interface for the Todo application, interacting with the API service for data persistence.

## Technology Stack
- **Framework:** Next.js (App Router), React
- **Language:** TypeScript
- **State Management:** TanStack Query (Server State), React Hooks (Local State)
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form, Zod
- **Testing:** Vitest (Unit/Component), Playwright (E2E)

## Architecture Pattern: Next.js App Router
The project follows Next.js conventions with the addition of a `features/` directory for organizing domain logic.
- **App Directory:** Defines routes, layouts, and pages.
- **Features:** Grouped by domain (e.g., `todos`).
- **Shared:** Common components, hooks, and API client.

## Data Architecture
- **Data Fetching:** TanStack Query is used for fetching and caching data from the API.
- **Schemas:** Zod is used for client-side validation and to match API contracts.

## UI Components
- **Feature Components:** Located in `src/features/[feature]/components`.
- **Shared UI:** Reusable components in `src/shared/ui` and `packages/ui`.

## Source Tree
- `src/app/`: Route definitions and core application layout.
- `src/features/todos/`: Todo-specific components and logic.
- `src/shared/api/`: API client and shared schemas.
- `src/shared/ui/`: Reusable web components.

## Development Workflow
- **Dev Mode:** `pnpm dev` (runs `next dev`).
- **Build:** `pnpm build` (runs `next build`).
- **Tests:** `pnpm test` (Vitest), `pnpm test:e2e` (Playwright).

## Deployment Architecture
- **Deployment:** Vercel or similar Next.js-compatible platforms.
- **CI/CD:** GitHub Actions workflow `test.yml` handles testing and builds.
