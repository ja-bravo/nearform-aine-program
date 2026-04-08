# nearform-aine-bmad

A full-stack **Todo** application built as a monorepo with [Turborepo](https://turbo.build/repo), [pnpm](https://pnpm.io), and [Docker Compose](https://docs.docker.com/compose/).

| App / Package | Stack | Path |
|---------------|-------|------|
| **Web** | Next.js 16 (App Router), React 19, TanStack Query, Tailwind CSS 4 | `apps/web` |
| **API** | Fastify 5, PostgreSQL 16, `@nearform/sql`, Zod 4 | `apps/api` |
| **UI** | Shared React component library | `packages/ui` |

```mermaid
flowchart LR
    Browser -->|REST / JSON| Web["apps/web<br/>Next.js"]
    Web -->|SSR & client| API["apps/api<br/>Fastify"]
    API --> PG[(PostgreSQL 16)]
```

## Prerequisites

- **Node.js** ≥ 18 (22 LTS recommended)
- **pnpm** 9+ — `corepack enable && corepack prepare pnpm@latest --activate`
- **Docker** + Docker Compose v2

## Quickstart

```bash
pnpm install
cp .env.example .env          # defaults match docker-compose.yml
docker compose up --build      # starts postgres → api → web
```

| Service | URL | Health check |
|---------|-----|--------------|
| Web | http://localhost:3000 | `/healthz` |
| API | http://localhost:3001 | `/healthz/live`, `/healthz/ready` |

Ports are configurable via `WEB_PORT` and `API_PORT` in `.env`.

## Local Development (without Docker for Node)

Run Postgres in Docker, everything else natively with hot-reload:

```bash
docker compose up postgres -d
pnpm turbo run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

The Next.js server calls the API using `API_BASE_URL` (SSR, internal network in Compose) or `NEXT_PUBLIC_API_BASE_URL` (browser). CORS is controlled by `CORS_ORIGIN` in `.env`.

## Project Structure

```
├── apps/
│   ├── api/                  # Fastify REST API
│   │   ├── migrations/       # Postgrator SQL migrations (run on boot)
│   │   └── src/
│   │       ├── features/todos/
│   │       └── shared/       # db, http plugins
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/          # App Router pages
│           ├── features/todos/
│           └── shared/       # hooks, api client, ui
├── packages/
│   ├── ui/                   # Shared React components
│   ├── eslint-config/
│   └── typescript-config/
├── perf/                     # k6 load-test scripts + budgets
├── docs/                     # Generated & authored project docs
└── docker-compose.yml
```

Both apps follow a **feature-first** layout: domain logic lives under `features/<name>/` with co-located tests.

## Common Commands

```bash
pnpm turbo run build          # production build (all apps)
pnpm turbo run lint            # ESLint
pnpm turbo run typecheck       # TypeScript --noEmit
pnpm turbo run test            # unit + component tests (Vitest)
pnpm --filter web test:e2e     # Playwright E2E
pnpm --filter web quality-gate # axe-core accessibility gate
pnpm test:perf                 # k6 performance tests
```

## Database

Migrations are managed by [Postgrator](https://www.npmjs.com/package/postgrator) and live in `apps/api/migrations/`. They run automatically when the API boots — no manual step required for development.

To run migrations manually:

```bash
pnpm --filter api migrate
```

### Test Database

An isolated Postgres instance is available behind the `test` profile (port **5433**, database `todo_test`) so integration tests never collide with dev data:

```bash
pnpm test:db:up               # starts postgres_test container
RUN_DB_TESTS=1 DATABASE_URL=postgresql://todo:todo@127.0.0.1:5433/todo_test \
  pnpm --filter api test
```

### Clean Restart (wipe data)

```bash
docker compose down -v
docker compose up --build
```

## API Overview

The API exposes a single resource at `/api/v1/todos` (CRUD). All responses follow a consistent envelope:

- **Success:** `{ "data": { ... }, "meta": { "requestId": "..." } }`
- **Error:** `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`

No stack traces are ever returned to clients. See the [API contracts documentation](./docs/api-contracts-api.md) for the full schema, request/response examples, and error codes.

## Testing

| Layer | Tool | Command |
|-------|------|---------|
| Unit / Component | Vitest + Testing Library | `pnpm turbo run test` |
| E2E | Playwright | `pnpm --filter web test:e2e` |
| Accessibility | axe-core via Playwright | `pnpm --filter web quality-gate` |
| Performance | k6 | `pnpm test:perf` |
| DB Integration | Vitest + real Postgres | See [Test Database](#test-database) above |

Minimum coverage target: **70%** for core feature logic.

## CI

GitHub Actions runs lint, typecheck, unit tests, E2E, and the accessibility quality gate on every push. See [`.github/workflows/test.yml`](.github/workflows/test.yml) and the [CI documentation](./docs/ci.md) for details.

## Documentation

The `docs/` folder contains generated and authored documentation covering architecture, API contracts, data models, deployment, security, accessibility, and the AI integration story behind this project.

Start with the [documentation index](./docs/index.md).

## Security Notes

- Terminate TLS at the edge in production — `NEXT_PUBLIC_API_BASE_URL` must be `https://`.
- The API returns a consistent error envelope; no internal stack traces leak to clients.
- No ORM — all queries use `@nearform/sql` with parameterized SQL.
