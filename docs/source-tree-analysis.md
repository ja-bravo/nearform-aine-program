# Source Tree Analysis

## Repository Layout

```
nearform-aine-bmad/                 # Turborepo monorepo root
├── apps/
│   ├── api/                        # Fastify REST API (Part: api)
│   │   ├── migrations/             # Postgrator SQL migrations (run on boot)
│   │   │   ├── 001.do.create-todos.sql
│   │   │   ├── 001.undo.create-todos.sql
│   │   │   ├── 002.do.add-todos-indexes.sql
│   │   │   └── 002.undo.add-todos-indexes.sql
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   └── todos/          # Todo domain — routes, schemas, repository, mappers
│   │   │   │       ├── todo-routes.ts        ← Route registrations (POST, GET, PATCH, DELETE)
│   │   │   │       ├── todo-schemas.ts       ← Zod schemas for request/response validation
│   │   │   │       ├── todo-repository.ts    ← Data-access layer (@nearform/sql queries)
│   │   │   │       ├── todo-mappers.ts       ← DB row → API DTO mapper (snake_case → camelCase)
│   │   │   │       └── *.test.ts             ← Co-located unit & integration tests
│   │   │   ├── shared/
│   │   │   │   ├── db/
│   │   │   │   │   ├── pool.ts               ← Singleton pg.Pool (lazy-init from DATABASE_URL)
│   │   │   │   │   └── migration-runner.ts   ← Postgrator runner; called on startup
│   │   │   │   └── http/
│   │   │   │       └── error-envelope.ts     ← Standardized error response builder
│   │   │   ├── index.ts            ← Entry point: runs migrations, starts Fastify
│   │   │   ├── migrate.ts          ← Standalone migration script
│   │   │   └── server.ts           ← createServer() — CORS, error handler, health checks, routes
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig*.json
│   │
│   └── web/                        # Next.js 16 frontend (Part: web)
│       ├── e2e/                    # Playwright E2E specs
│       │   ├── a11y/              # Accessibility test suites (axe-core)
│       │   └── *.spec.ts
│       ├── src/
│       │   ├── app/                # Next.js App Router
│       │   │   ├── layout.tsx      ← Root layout: QueryProvider, A11yAnnouncer, OfflineBanner
│       │   │   ├── page.tsx        ← Home page (SSR loads todos, renders TodoAppClient)
│       │   │   ├── query-provider.tsx  ← TanStack QueryClientProvider
│       │   │   ├── healthz/route.ts    ← Liveness probe endpoint
│       │   │   └── globals.css
│       │   ├── features/
│       │   │   └── todos/
│       │   │       ├── components/
│       │   │       │   ├── todo-app-client.tsx        ← Client entry (wraps in TodosSyncProvider)
│       │   │       │   ├── todo-home-content.tsx      ← Orchestrates QuickCapture + TodoList
│       │   │       │   ├── quick-capture-bar.tsx      ← Form: create todo with validation & retry
│       │   │       │   ├── todo-list.tsx              ← Renders items, empty state, error state
│       │   │       │   ├── todo-item-row.tsx          ← Single todo: toggle, delete, retry, a11y
│       │   │       │   ├── todos-sync-context.tsx     ← React Context for optimistic list updates
│       │   │       │   ├── persistence-status-badge.tsx  ← saving/saved/error indicator
│       │   │       │   └── *.test.tsx                 ← Co-located component tests
│       │   │       ├── hooks/
│       │   │       │   ├── use-create-todo-mutation.ts
│       │   │       │   ├── use-complete-todo-mutation.ts
│       │   │       │   ├── use-delete-todo-mutation.ts
│       │   │       │   └── use-persistence-status.ts
│       │   │       ├── server/
│       │   │       │   └── load-todos.ts              ← SSR data loader (server-only)
│       │   │       ├── capture-schema.ts              ← Zod schema for quick-capture form
│       │   │       └── test/
│       │   │           └── render-with-todos-client.tsx
│       │   └── shared/
│       │       ├── api/
│       │       │   ├── fetch-json.ts          ← Client-side fetch wrapper (browser)
│       │       │   ├── fetch-json-server.ts   ← Server-side fetch wrapper (SSR, server-only)
│       │       │   ├── api-error.ts           ← Custom ApiError class
│       │       │   ├── schemas.ts             ← Shared Zod schemas (TodoDto, responses, error)
│       │       │   └── env.ts                 ← API base URL resolution (public + internal)
│       │       ├── hooks/
│       │       │   └── use-connectivity.ts    ← Online/offline detection via TanStack onlineManager
│       │       └── ui/
│       │           ├── index.tsx              ← Barrel exports
│       │           ├── error-message.tsx       ← Reusable error display with retry
│       │           ├── loading-state.tsx       ← Skeleton loading placeholder
│       │           ├── a11y-announcer.tsx      ← Screen reader live-region announcer
│       │           └── offline-read-only-banner.tsx  ← Sticky offline warning banner
│       ├── playwright.config.ts
│       ├── .lighthouserc.js
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                         # Shared React component library (Part: ui)
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── code.tsx
│   ├── eslint-config/              # Shared ESLint configuration
│   └── typescript-config/          # Shared tsconfig bases
│
├── perf/                           # Performance testing
│   ├── k6/                         # k6 load-test scripts
│   │   ├── api-read-scenarios.js
│   │   ├── api-write-scenarios.js
│   │   └── bulk-load-scenario.js
│   └── budgets/
│       └── api-budgets.json        # p95 latency thresholds
│
├── docs/                           # Generated & authored project documentation
├── scripts/                        # Dev utility scripts
├── .github/workflows/test.yml      # CI pipeline (lint → build → test → e2e → quality gate)
├── docker-compose.yml              # postgres + postgres_test + api + web
├── turbo.json                      # Turborepo task graph
├── pnpm-workspace.yaml             # Workspace packages: apps/* + packages/*
└── package.json                    # Root: build, dev, lint, test, compose scripts
```

## Critical Directories

| Directory | Purpose |
|-----------|---------|
| `apps/api/src/features/todos/` | All todo-domain API logic: routes, validation, data access, mapping |
| `apps/api/src/shared/db/` | Database connection pool and migration runner |
| `apps/api/src/shared/http/` | HTTP error envelope standardization |
| `apps/api/migrations/` | Postgrator SQL migrations (auto-run on API boot) |
| `apps/web/src/app/` | Next.js App Router pages and root layout |
| `apps/web/src/features/todos/` | Todo UI components, hooks, server loaders, form schemas |
| `apps/web/src/shared/api/` | API client layer (browser + SSR fetch wrappers, Zod schemas) |
| `apps/web/src/shared/hooks/` | Cross-cutting hooks (connectivity detection) |
| `apps/web/src/shared/ui/` | Reusable UI primitives (error, loading, a11y, offline banner) |
| `apps/web/e2e/` | Playwright E2E and accessibility test suites |
| `packages/ui/src/` | Shared React components (Button, Card, Code) |
| `perf/` | k6 load-test scripts and performance budget JSON |

## Entry Points

| Part | Entry File | Description |
|------|-----------|-------------|
| API | `apps/api/src/index.ts` | Runs migrations, creates Fastify server, listens on `API_PORT` |
| Web | `apps/web/src/app/layout.tsx` | Root layout; `page.tsx` is the home page (SSR todo loading) |
| UI | `packages/ui/src/*.tsx` | Direct file exports via `package.json` exports map |

## Integration Points

| From | To | Mechanism |
|------|-----|-----------|
| Web (browser) | API | `fetchJson()` → REST calls to `NEXT_PUBLIC_API_BASE_URL/api/v1/todos` |
| Web (SSR) | API | `fetchJsonServer()` → REST calls to `API_BASE_URL` (internal Docker network) |
| API | PostgreSQL | `pg.Pool` via `@nearform/sql` parameterized queries |
