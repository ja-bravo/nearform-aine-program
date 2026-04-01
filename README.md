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

## Monorepo tasks

```bash
pnpm turbo run build      # production build (web + api)
pnpm turbo run lint
pnpm turbo run typecheck
pnpm turbo run test
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
- Database **migrations** are introduced in later stories; this slice only ensures Postgres and readiness checks.
