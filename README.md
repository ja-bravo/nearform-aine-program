# nearform-aine-bmad

Turborepo monorepo: **Next.js** (`apps/web`), **Fastify** (`apps/api`), **PostgreSQL** via **Docker Compose**. Package manager: **pnpm**.

## Prerequisites

- **Node.js** 22 LTS (or 20+; see root `engines`)
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker** + Docker Compose v2 (for the full stack)

## First-time setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env` if you change ports or database credentials. Defaults match `docker-compose.yml`.

## Run the full stack (Compose)

```bash
docker compose up --build
```

If **port 5432 is already taken** on your machine (another Postgres instance), map the host side to a free port before starting:

```bash
POSTGRES_PORT=5433 docker compose up --build
```

The API container still connects to Postgres on the internal `postgres:5432` service; only the **host** mapping changes.

Wait until health checks pass, then verify:

| Service   | Check |
|-----------|--------|
| Web       | [http://localhost:3000/healthz](http://localhost:3000/healthz) → JSON `{ "status": "ok" }` |
| API live  | [http://localhost:3001/healthz/live](http://localhost:3001/healthz/live) |
| API ready | [http://localhost:3001/healthz/ready](http://localhost:3001/healthz/ready) → 200 when Postgres is reachable |

Ports come from `.env` (`WEB_PORT`, `API_PORT`).

## Todos API (`/api/v1/todos`)

JSON only. List responses use **`{ "data": { "todos": [ ... ] }, "meta": { "requestId": "..." } }`**. Create responses use **`{ "data": { ...todo }, "meta": { "requestId": "..." } }`**. Todos in **`GET /api/v1/todos`** are ordered by **`createdAt` descending** (newest first). Errors use **`{ "error": { "code", "message", "details?", "requestId" } }`** (no stack traces in the body).

Create a todo:

```bash
curl -sS -X POST "http://localhost:3001/api/v1/todos" \
  -H "Content-Type: application/json" \
  -d '{"description":"Buy milk"}'
```

List todos:

```bash
curl -sS "http://localhost:3001/api/v1/todos"
```

Toggle todo completion:

```bash
curl -sS -X PATCH "http://localhost:3001/api/v1/todos/{id}" \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}'
```

Success response (200):

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Buy milk",
    "isCompleted": true,
    "createdAt": "2026-03-31T10:30:00.000Z"
  },
  "meta": {
    "requestId": "req-12345abcde"
  }
}
```

Error responses:

- **404 NOT_FOUND** — Todo id does not exist
- **400 VALIDATION_ERROR** — Invalid request body (e.g., `isCompleted` is not a boolean or is missing)

**Compose startup order:** `postgres` exposes a healthcheck (`pg_isready`). The **api** service uses `depends_on: postgres: condition: service_healthy`, so Postgres accepts connections before the API image builds and starts. **web** waits on **api** health (`/healthz/live`), so the database and migrations complete before the UI container is considered up.

## Database migrations (Postgrator)

SQL migrations live in **`apps/api/migrations/`** and are applied with **[Postgrator 8.0.0](https://www.npmjs.com/package/postgrator)**. Files use Postgrator’s naming: **`NNN.do.<description>.sql`** (apply) and **`NNN.undo.<description>.sql`** (revert). Version history is stored in the PostgreSQL table **`schemaversion`** (default Postgrator table).

**Primary path:** on each API boot, **`runMigrations()`** runs before `listen`, so pending migrations apply exactly once before traffic is served. If a migration fails (bad SQL, DB down, permissions), the process **exits** after logging a structured error (no stack traces on HTTP responses—the server never listens).

**Manual / CI (optional):** from the repo root, after `DATABASE_URL` is set:

```bash
pnpm --filter api migrate
```

Uses `tsx` against `apps/api/src/migrate.ts`. After `pnpm --filter api build`, the same entry exists as **`node apps/api/dist/migrate.js`**.

**Local requirements:** the API now expects **`DATABASE_URL`** at startup so migrations can run. For UI-only work without Postgres, start **postgres** or point `DATABASE_URL` at a reachable instance.

### DB-backed tests

Integration tests that run migrations against a real Postgres are **opt-in**:

```bash
docker compose up postgres -d
RUN_DB_TESTS=1 DATABASE_URL=postgresql://todo:todo@127.0.0.1:5432/todo pnpm --filter api test
```

## Backup and recovery (MVP)

For MVP and single-node deploys, treat the Postgres **volume** as the source of truth: snapshot the data directory or run **`pg_dump`** on a schedule you can actually restore from. There is no automated multi-AZ failover in this baseline—document who runs backups, how often, and where dumps live so an acknowledged write can be recovered after operator error or host loss.

### Clean restart (data wipe)

```bash
docker compose down -v
docker compose up --build
```

## Local development (without Docker for Node apps)

Start Postgres only (or use a local instance and set `DATABASE_URL`):

```bash
docker compose up postgres -d
pnpm turbo run dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001) — set `API_PORT` / `DATABASE_URL` in `.env` as needed.





- API: [http://localhost:3001](http://localhost:3001) — set `API_PORT` / `DATABASE_URL` in `.env` as needed.

The home page loads todos from the API using **`NEXT_PUBLIC_API_BASE_URL`**. The API enables **CORS** for browser calls: set **`CORS_ORIGIN`** to a comma-separated list of allowed web origins (default **`http://localhost:3000`**, aligned with **`WEB_PORT`**). Docker Compose passes **`CORS_ORIGIN`** into the **`api`** service so the UI at **`http://localhost:3000`** can call **`http://localhost:3001`**.

## Monorepo tasks

```bash
pnpm turbo run build      # production build (web + api)
pnpm turbo run lint
pnpm turbo run typecheck
pnpm turbo run test
pnpm --filter web test    # web unit/component tests (Vitest)
```

## Turborepo bootstrap note

The repo root already contained `_bmad-output/` and `.cursor/`, so `create-turbo` could not target `.` directly. The baseline was generated with:

```bash
CI=1 pnpm dlx create-turbo@latest <empty-temp-dir> -m pnpm --no-git
```

Then **packages/** and root **Turbo/pnpm** files were merged here. **`apps/web`** was added with `pnpm create next-app` (TypeScript, App Router, `src/`, ESLint, Tailwind, pnpm). **`apps/api`** is a Fastify TypeScript app.

## Security / production (baseline)

- **HTTPS:** In production, terminate TLS at the edge and expose the API to browsers **only** over HTTPS (`NEXT_PUBLIC_API_BASE_URL` must be an `https://` origin).
- **Errors:** The API returns a consistent JSON error shape and does not send stack traces to clients.
- **Exposure:** Default compose defines **no** admin or bulk-export routes.

## Idempotency

- Running **`pnpm install`** again is safe.
- Running **`docker compose up`** again is incremental; use **`docker compose down -v`** only when you need a clean database volume.
- Database **migrations** run automatically when the API starts; see **Database migrations (Postgrator)** above.
