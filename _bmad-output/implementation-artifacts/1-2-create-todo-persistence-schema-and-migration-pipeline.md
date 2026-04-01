# Story 1.2: Create Todo persistence schema and migration pipeline

Status: done

## Story

As a **user** (and operator),  
I want **todos stored durably** with a **versioned SQL schema** and **deterministic migrations**,  
So that data **survives API restarts** (FR11–FR13) and **acknowledged writes are not lost** after normal process restarts (NFR7), with **documented backup expectations** for MVP deploys (NFR8).

**Traceability:** FR11, FR12, FR13 · NFR7, NFR8

## Acceptance Criteria

1. **Migrations directory and ordering**  
   **Given** the API package  
   **When** migrations are inspected  
   **Then** SQL files live under **`apps/api/migrations/`** with **deterministic ordering** compatible with **Postgrator** (e.g. `001_*.up.sql` / `001_*.down.sql` per team convention).  
   **And** initial migration creates table **`todos`** with **`snake_case`** columns aligned to future API **`camelCase`** mapping: at minimum **`id`**, **`description`**, **`is_completed`**, **`created_at`** (use types appropriate for PostgreSQL: e.g. `UUID` or `TEXT` for id, `TEXT` for description, `BOOLEAN`, `TIMESTAMPTZ`).

2. **Indexes**  
   **Given** migrations run  
   **Then** a follow-up migration adds indexes per architecture naming (**`idx_todos_<columns>`**), at minimum supporting **list-by-creation-order** (e.g. index on **`created_at`**) for upcoming list endpoint performance.

3. **Postgrator execution**  
   **Given** **`DATABASE_URL`** points at a running Postgres  
   **When** the API **starts** (or a dedicated **`pnpm --filter api migrate`** script runs, if you split CLI—prefer **single documented path**)  
   **Then** **Postgrator (`8.0.0`)** applies all pending migrations exactly once per version and records history in the configured migration table.

4. **Startup gating**  
   **Given** migrations are enabled on startup  
   **When** a migration **fails** (bad SQL, DB down, permissions)  
   **Then** the API **does not** accept normal traffic: process **exits** or **fails readiness** with a **clear, actionable log message** and **safe client-facing error** if anything binds before listen (no stack traces to clients — extend existing `toErrorBody` pattern from Story 1.1).

5. **Durability smoke**  
   **Given** migrations applied and a **manual or test** insert into **`todos`**  
   **When** the API container/process **restarts** normally  
   **Then** the row **still exists** (validates FR11–FR13 / NFR7 at schema layer).

6. **Dependencies**  
   **Given** `apps/api/package.json`  
   **Then** **`postgrator`** is pinned to **`8.0.0`** (or exact version team locks) and **`@nearform/sql`** to **`1.10.7`** per architecture (adjust patch if lockfile demands, but document drift).

7. **Documentation**  
   **Given** `README.md` (root or `apps/api`)  
   **Then** developers know how to **run migrations** locally and how **compose** ensures DB before API (ordering / `depends_on` + health).

## Tasks / Subtasks

- [x] **T1 — Add dependencies** (AC: 6)  
  - [x] Add `postgrator@8.0.0` and `@nearform/sql@1.10.7` to `apps/api`.  
  - [x] Add any minimal peer deps Postgrator needs for `pg` driver (confirm with Postgrator docs).

- [x] **T2 — SQL migrations** (AC: 1, 2)  
  - [x] `001_create_todos.up.sql` / `.down.sql`: create/drop `todos` with constraints (e.g. `NOT NULL` on `description`, `created_at` default `now()`).  
  - [x] `002_add_todos_indexes.up.sql` / `.down.sql`: `idx_todos_created_at` (and drop).

- [x] **T3 — Migration runner module** (AC: 3, 4)  
  - [x] Implement `apps/api/src/shared/db/migration-runner.ts` (or equivalent path matching architecture tree intent) using Postgrator + `pg`.  
  - [x] Configure **migration directory**, **schema table** name (e.g. `schemaversion` or Postgrator default — document).  
  - [x] On failure: log **full internal cause** server-side; **never** leak stack to HTTP responses.

- [x] **T4 — Wire startup** (AC: 3, 4)  
  - [x] In `apps/api/src/index.ts` (or `server.ts` bootstrap): **`await runMigrations()`** before `app.listen` (or before registering business routes if server is created separately).  
  - [x] Ensure **liveness** `/healthz/live` can still match compose design; **readiness** `/healthz/ready` should only pass when DB reachable **and** migrations successful (adjust current `/healthz/ready` if it only checks `SELECT 1` — after migrations, same check may suffice if migrations ran at boot).

- [x] **T5 — @nearform/sql readiness (minimal)** (AC: 6)  
  - [x] Add a tiny **smoke** use of `@nearform/sql` (e.g. shared `sql` tag + pool file in `shared/db/`) **or** document that repository layer lands in 1.3 but dependency is installed and pool factory exists — **prefer** minimal pool + one `SELECT 1` through `@nearform/sql` in migration runner tests to prove wiring.

- [x] **T6 — Tests** (AC: 5)  
  - [x] Integration or unit tests: mock pg / testcontainer optional; minimum **Vitest** test that migration SQL parses, or **integration** against `DATABASE_URL` when `CI` or `RUN_DB_TESTS=1`.  
  - [x] Document how to run DB-backed tests in README.

- [x] **T7 — Docs & NFR8** (AC: 7, NFR8)  
  - [x] README section: **backup/recovery expectation** for MVP (e.g. single-node Postgres volume snapshot / `pg_dump` — one short paragraph satisfies NFR8 at planning level).

## Dev Notes

### Previous story intelligence (Story 1.1)

- API uses **`createServer()`** in `apps/api/src/server.ts` with **`toErrorBody`** — reuse for any startup HTTP errors; keep **no stack traces** on client responses.  
- Postgres client uses **`connectionTimeoutMillis`** — apply same for migration connections.  
- **Vitest** already used in `apps/api/src/server.test.ts` — extend pattern for migration tests.  
- **Monorepo** lives at repo root; `apps/api` is Fastify + `pg` today — add Postgrator without breaking `pnpm turbo run build` / `test`.

### Architecture compliance (must follow)

- **Migrations:** SQL-first, **`apps/api/migrations/`**, Postgrator **8.0.0**. [Source: `_bmad-output/planning-artifacts/architecture.md` — Data Architecture, File Structure]  
- **DB naming:** tables/columns **`snake_case`**, index `idx_todos_*`. [Source: architecture — Naming Patterns]  
- **Data access:** **`@nearform/sql` 1.10.7**, parameterized queries only (no ORM). [Source: architecture — Data Architecture]  
- **Execution:** migrations run **before API serves traffic** (single path; architecture gap item: prefer **startup hook** OR **compose one-shot** — **choose one and document**). [Source: architecture — Infrastructure & Deployment, Gap Analysis]  
- **Feature layout (future):** `apps/api/src/features/todos/todo-repository.ts` will map DB↔API; this story only establishes **schema + migration pipeline**.

### Out of scope for this story

- **`/api/v1/todos`** HTTP routes, zod DTOs, canonical `{ data, meta }` envelopes — **Story 1.3**.  
- **Web UI** todo list — **Story 1.4**.  
- **Full** error envelope with **`requestId`** on every route — can wait until shared HTTP layer story; migrations should still **log** correlation if available.

### Schema hint (illustrative — finalize in SQL files)

| Column (DB)      | Notes |
|------------------|--------|
| `id`             | UUID default `gen_random_uuid()` or equivalent |
| `description`    | `TEXT NOT NULL` |
| `is_completed`   | `BOOLEAN NOT NULL DEFAULT false` |
| `created_at`     | `TIMESTAMPTZ NOT NULL DEFAULT now()` |

### Testing requirements

- **Unit:** migration file presence, Postgrator config (mock `pg`).  
- **Integration (recommended):** with `docker compose up postgres` and `DATABASE_URL`, run migrations then assert table + index exist (`information_schema` / `pg_indexes`).  
- **CI:** document if DB tests are optional until CI service container exists.

## References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.2  
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — migrations, Postgrator, `@nearform/sql`, naming, startup  
- Prior implementation: `apps/api/src/server.ts`, `apps/api/src/index.ts`, `apps/api/package.json`  

### Review Findings

- [x] [Review] Clean review — AC1–7 satisfied; no patch or decision items (`bmad-code-review`, 2026-04-01).

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- Postgrator requires migration filenames **`NNN.do.<name>.sql`** / **`NNN.undo.<name>.sql`** (not `.up`/`.down`); implemented as `001.do.create-todos.sql`, `002.do.add-todos-indexes.sql`, etc., with README callout.
- **`runMigrations()`** runs a **`@nearform/sql` `SELECT 1`** on the migration client before Postgrator; shared **`getPool()`** / **`pingDbWithNearformSql()`** in `pool.ts` for reuse.
- Startup path: **`index.ts`** awaits migrations before **`listen`**; failures log structured JSON to stderr and **`process.exit(1)`** (no HTTP listener).
- **`pnpm --filter api migrate`** runs `tsx src/migrate.ts`; after build, **`node dist/migrate.js`** documented for production-style runs.
- Vitest: always-on checks for SQL artifacts and missing `DATABASE_URL`; opt-in **`RUN_DB_TESTS=1`** integration suite inserts into `todos` and validates `schemaversion`, columns, and `idx_todos_created_at`.

### File List

- `apps/api/package.json`
- `apps/api/migrations/001.do.create-todos.sql`
- `apps/api/migrations/001.undo.create-todos.sql`
- `apps/api/migrations/002.do.add-todos-indexes.sql`
- `apps/api/migrations/002.undo.add-todos-indexes.sql`
- `apps/api/src/shared/db/migration-runner.ts`
- `apps/api/src/shared/db/migration-runner.test.ts`
- `apps/api/src/shared/db/pool.ts`
- `apps/api/src/migrate.ts`
- `apps/api/src/index.ts`
- `README.md`
- `pnpm-lock.yaml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-04-01: Story 1.2 — Postgrator migrations, `todos` schema + index, startup gating, `@nearform/sql` wiring, tests, README (migrations + backup).
- 2026-04-01: Code review — clean; story marked done.

---

**Story completion status:** done — Code review complete.
