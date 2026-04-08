# Development Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 (22 LTS recommended) | |
| pnpm | 9+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| Docker | Latest + Compose v2 | Required for PostgreSQL |

## Initial Setup

```bash
git clone <repo-url>
cd nearform-aine-bmad
pnpm install
cp .env.example .env
```

The `.env` file defaults match `docker-compose.yml`, so no edits are needed for local development.

## Running the Full Stack

### Option A: Docker Compose (everything containerized)

```bash
docker compose up --build
```

Starts PostgreSQL → API (with auto-migrations) → Web. All services use health checks to ensure correct startup ordering.

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

### Option B: Hybrid (Postgres in Docker, apps native with hot-reload)

```bash
docker compose up postgres -d
pnpm turbo run dev
```

This gives you hot-reload for both apps while keeping the database containerized. The API runs migrations automatically on boot.

## Environment Variables

| Variable | Used By | Default | Purpose |
|----------|---------|---------|---------|
| `DATABASE_URL` | API | `postgresql://todo:todo@localhost:5432/todo` | PostgreSQL connection string |
| `API_PORT` | API | `3001` | Fastify listen port |
| `API_HOST` | API | `0.0.0.0` | Fastify bind address |
| `CORS_ORIGIN` | API | `http://localhost:3000` | Comma-separated allowed origins |
| `NEXT_PUBLIC_API_BASE_URL` | Web | `http://localhost:3001` | Browser-visible API URL |
| `API_BASE_URL` | Web (SSR) | Falls back to `NEXT_PUBLIC_API_BASE_URL` | Internal API URL for server-side rendering |
| `WEB_PORT` | Web | `3000` | Next.js listen port |
| `POSTGRES_USER` | Docker | `todo` | Dev database username |
| `POSTGRES_PASSWORD` | Docker | `todo` | Dev database password |
| `POSTGRES_DB` | Docker | `todo` | Dev database name |

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm turbo run build` | Production build (all apps) |
| `pnpm turbo run dev` | Start all apps with hot-reload |
| `pnpm turbo run lint` | Run ESLint across all packages |
| `pnpm turbo run typecheck` | Run TypeScript `--noEmit` checks |
| `pnpm turbo run test` | Unit + component tests (Vitest) |
| `pnpm turbo run test:coverage` | Tests with coverage report |
| `pnpm --filter web test:e2e` | Playwright E2E tests |
| `pnpm --filter web quality-gate` | axe-core accessibility tests |
| `pnpm test:perf` | k6 performance tests |
| `pnpm --filter api migrate` | Run database migrations manually |

## Database Management

### Migrations

Managed by Postgrator. Migration files live in `apps/api/migrations/` using the naming convention `NNN.do.description.sql` (up) and `NNN.undo.description.sql` (down).

Migrations run automatically when the API starts. To run them manually:

```bash
pnpm --filter api migrate
```

### Test Database

An isolated PostgreSQL instance runs on port **5433** (database `todo_test`) using the Docker Compose `test` profile:

```bash
pnpm test:db:up                   # starts postgres_test container
pnpm test:db:down                 # stops it
pnpm test:db:logs                 # tail container logs
```

Run API integration tests against the test database:

```bash
RUN_DB_TESTS=1 DATABASE_URL=postgresql://todo:todo@127.0.0.1:5433/todo_test \
  pnpm --filter api test
```

### Clean Restart

```bash
docker compose down -v             # removes volumes (wipes all data)
docker compose up --build
```

## Testing Strategy

| Layer | Tool | Location | Command |
|-------|------|----------|---------|
| Unit / Component | Vitest + Testing Library | Co-located `*.test.ts(x)` | `pnpm turbo run test` |
| Integration (DB) | Vitest + real PostgreSQL | Co-located `*.integration.test.ts` | See Test Database above |
| E2E | Playwright | `apps/web/e2e/` | `pnpm --filter web test:e2e` |
| Accessibility | axe-core via Playwright | `apps/web/e2e/a11y/` | `pnpm --filter web quality-gate` |
| Performance | k6 | `perf/k6/` | `pnpm test:perf` |

**Coverage target:** 70% minimum for core feature logic.

## Code Conventions

- **Feature-first** directory structure under `features/<name>/`
- **Named exports** over default exports
- **Zod** for all I/O boundary validation
- **`@nearform/sql`** for parameterized SQL — no ORM allowed
- **camelCase** in API responses — DB `snake_case` is mapped in the data access layer
- **Co-located tests** next to the source files they test
- **Conventional Commits** for commit messages

## Adding a New Feature

1. Create a directory under `apps/<app>/src/features/<feature-name>/`
2. Add route/component files, Zod schemas, repository (API) or hooks (Web)
3. Co-locate tests as `*.test.ts(x)`
4. Register routes in `server.ts` (API) or add to the page tree (Web)
5. If the feature touches the database, add a new migration in `apps/api/migrations/`
6. Run the full test suite: `pnpm turbo run test && pnpm --filter web test:e2e`
