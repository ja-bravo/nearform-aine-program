# Source Tree Analysis

## Project Structure Overview
The project is a monorepo managed by Turbo and pnpm.

```
.
├── apps/
│   ├── api/             # Fastify REST API service
│   │   ├── migrations/  # Database migrations
│   │   └── src/         # API source code
│   └── web/             # Next.js web application
│       ├── e2e/         # Playwright E2E tests
│       └── src/         # Web source code
├── packages/
│   ├── ui/              # Shared UI component library
│   ├── eslint-config/   # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── perf/                # k6 performance testing scripts
├── docs/                # Project documentation
├── .github/             # GitHub actions workflows
├── turbo.json           # Turbo configuration
└── pnpm-workspace.yaml  # pnpm workspace definition
```

## Critical Folders

### apps/api/src
- `features/`: Contains domain-specific logic (e.g., `todos`).
- `shared/`: Shared utilities for database connection and HTTP handling.
- `index.ts`: Application entry point.
- `server.ts`: Fastify server configuration.

### apps/web/src
- `app/`: Next.js App Router pages and layout.
- `features/`: Domain-specific components and hooks.
- `shared/`: Shared UI components, hooks, and API client.

### packages/ui/src
- Contains reusable React components exported for use in `apps/web`.

## Entry Points
- **API Service**: `apps/api/src/index.ts`
- **Web Frontend**: `apps/web/src/app/page.tsx`
