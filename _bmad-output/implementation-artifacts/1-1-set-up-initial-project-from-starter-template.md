# Story 1.1: Set up initial project from starter template

Status: done

<!-- Ultimate context: dev agent should follow this file as the single source of truth for this slice. -->

## Story

As a **maintainer**,  
I want a **working Turborepo** with **Next.js web**, **Fastify API**, and **PostgreSQL** orchestrated via **Docker Compose**,  
So that the product can run **consistently locally and in CI** with **explicit health checks** and **no auth scaffolding** (v1 single implicit workspace).

**Traceability:** FR16, FR17 · NFR4, NFR5, NFR6 (baseline posture for TLS in deploy configs, safe errors, closed-by-default exposure).

## Acceptance Criteria

1. **Given** a fresh clone of the repository at the project root  
   **When** a developer follows the **documented** bootstrap steps (install deps, env from `.env.example`, compose up)  
   **Then** **`apps/web`**, **`apps/api`**, and **`postgres`** start successfully and **Docker Compose healthchecks** (or documented equivalent) pass for each service.

2. **Health endpoints exist and respond as specified in architecture:**  
   - Web: **`GET /healthz`** (or App Router route under `app/api/healthz` per architecture tree) returns success suitable for container health.  
   - API: **`GET /healthz/live`** (liveness) and **`GET /healthz/ready`** (readiness) return success when dependencies are satisfied.

3. **Repository layout** matches the architecture baseline: monorepo with **`apps/web`** (Next.js + TypeScript + Tailwind), **`apps/api`** (Fastify + TypeScript), **`packages/*`** as needed for shared types/config (may be minimal stubs in this story).

4. **Starter template requirement:** project foundation is created using **`pnpm dlx create-turbo@latest`** (or equivalent documented Turborepo init), then follow-up scaffolding per architecture (Next app in `apps/web`, Fastify in `apps/api`).

5. **Idempotent / repeatable setup:** running documented bootstrap **twice** on a clean machine does not leave conflicting state (clear docs for “clean start” vs “already installed”; no destructive duplicate steps).

6. **Security baseline hooks (story-level, not full hardening):**  
   - **Production-oriented** config documents **HTTPS** for browser→API (NFR4).  
   - API returns **safe, consistent error shape** for obvious failures (e.g. startup misconfig), **no stack traces** to clients (NFR5).  
   - No **world-readable** admin or bulk-export surfaces in default compose/prod profile (NFR6).

7. **Documentation:** root **`README.md`** explains prerequisites (Node, pnpm, Docker), exact commands to run dev stack, and how to verify health.

## Tasks / Subtasks

- [x] **T1 — Initialize Turborepo** (AC: 4, 3)  
  - [x] Run `pnpm dlx create-turbo@latest` at repo root (document exact flags if non-interactive CI is required).  
  - [x] Ensure `pnpm-workspace.yaml` and `turbo.json` align with `apps/*` and `packages/*`.

- [x] **T2 — Scaffold `apps/web` (Next.js)** (AC: 3)  
  - [x] `pnpm create next-app apps/web` with **TypeScript**, **App Router**, **`src/`**, **ESLint**, **Tailwind**, **pnpm** (match architecture follow-up command intent).  
  - [x] Add minimal **`GET /healthz`** route per architecture (`app/api/healthz/route.ts` or equivalent).

- [x] **T3 — Scaffold `apps/api` (Fastify)** (AC: 3, 2)  
  - [x] Create Fastify TypeScript app with plugins structure ready for later features.  
  - [x] Implement **`/healthz/live`** and **`/healthz/ready`** (readiness may check DB connectivity lightly or return 503 until DB URL is valid—document behavior).

- [x] **T4 — Docker Compose: `web`, `api`, `postgres`** (AC: 1, 2, 6)  
  - [x] Root `docker-compose.yml` (and optional overrides) with **named volume** for Postgres data, **networks**, **healthchecks**.  
  - [x] **`apps/web/Dockerfile`** and **`apps/api/Dockerfile`** multi-stage, **non-root** runtime user where applicable.  
  - [x] Root **`.env.example`** with required vars (`DATABASE_URL`, API port, web port, `NEXT_PUBLIC_*` API base URL if used).

- [x] **T5 — Turbo pipelines** (AC: 1, 5)  
  - [x] Wire `dev`, `build`, `lint`, `typecheck`, `test` (stub OK) in `turbo.json` for both apps.  
  - [x] Ensure `pnpm turbo run build` succeeds from root.

- [x] **T6 — Docs & idempotency** (AC: 5, 7)  
  - [x] README: clone → `pnpm install` → copy `.env.example` → `docker compose up` (or documented profile) → verify URLs.  
  - [x] Note “second run” / “clean reinstall” without duplicate migrations (migrations belong to **1.2**; this story only ensures DB container and readiness).

## Dev Notes

### Architecture compliance (must follow)

- **Starter:** Turborepo via `create-turbo`; first implementation story. [Source: `_bmad-output/planning-artifacts/architecture.md` — Starter Template Evaluation]  
- **Layout:** `apps/web` (Next.js), `apps/api` (Fastify), `packages/*` for shared contracts/config. [Source: architecture — Project Structure & Boundaries]  
- **Health boundaries:** Web `/healthz`; API `/healthz/live`, `/healthz/ready`. [Source: architecture — Architectural Boundaries]  
- **Transport:** Local HTTP acceptable; **production HTTPS-only** for browser→API. Document in `.env.example` / README. [Source: architecture — Authentication & Security]  
- **Naming:** React components `PascalCase`; non-component TS `kebab-case`; API JSON `camelCase`; DB `snake_case` (future stories). [Source: architecture — Naming Patterns]  
- **No auth in v1:** single implicit workspace; do not add login/signup flows. [Source: `prd.md` — Product Scope / FR17]

### Out of scope for this story (do not implement)

- Todo **CRUD**, **migrations**, **Postgrator**, **zod route schemas**, **TanStack Query** UI — those start in **1.2** onward.  
- Full **Helmet/CORS/rate-limit** production hardening — **stub** or **placeholder** only if needed for Fastify to boot; complete in API stories.  
- **CI workflows** — optional minimal file; full quality gates can follow sprint-planning.

### Project structure notes

- This repo is **greenfield**: there is **no** existing `package.json` at repo root yet. Implement the monorepo **at the repo root** alongside `_bmad-output/` and `.cursor/` (do not nest the app inside `_bmad-output`).

### Previous story intelligence

- **None** — first story in Epic 1.

### Git intelligence

- Workspace is **not** a git repository in this environment; establish conventions from architecture only. If git is initialized later, follow standard `.gitignore` for Node/Docker.

### Latest technical specifics

- **Package manager:** **pnpm** (architecture follow-up commands use `--use-pnpm`).  
- **Turborepo:** `create-turbo@latest` — use current CLI defaults; pin versions in `package.json` after generation if the team requires reproducibility.  
- **Next.js / Fastify:** use current stable versions compatible with the generated workspace; align with architecture version pins when those stories add them (`zod` 4.x, TanStack Query 5.x, etc.).

## Technical Requirements

| Area | Requirement |
|------|-------------|
| Runtime | Node LTS compatible with Next.js + Fastify toolchain chosen |
| Monorepo | pnpm workspaces + Turborepo task graph |
| Containers | `docker-compose` brings up postgres + builds/runs web + api; healthchecks wired |
| Env | Fail-fast validation for required env vars in the API (minimal) |
| Docs | README is sufficient for a new developer to run the stack |

## Testing Requirements

- **Manual:** After `docker compose up`, curl or browser hit web `/healthz` and API `/healthz/live`, `/healthz/ready`.  
- **Automated (optional this story):** minimal smoke script or single integration test that asserts health URLs return 200 when stack is up—defer if timeboxed; prefer **Story 1.3+** for contract tests.

## References

- Epics & AC: `_bmad-output/planning-artifacts/epics.md` — Story 1.1  
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Starter Template, Core Decisions, Project Structure, Boundaries  
- PRD scope: `_bmad-output/planning-artifacts/prd.md` — MVP, FR16–FR17, NFR-S* / NFR-A* context  

### Review Findings

- [x] [Review][Patch] Add `connectionTimeoutMillis` on Postgres client for `GET /healthz/ready` — avoids hung readiness when DB TCP stalls [`apps/api/src/server.ts`]

## Dev Agent Record

### Agent Model Used

Cursor agent / GPT-5.2 (Amelia / bmad-dev-story workflow)

### Debug Log References

- `create-turbo` could not run in-place (conflicting root paths); scaffold merged from temp dir (documented in README).
- `docker compose build` not executed here: Docker daemon unavailable in agent environment; Dockerfiles and compose validated by static review + local `pnpm turbo run build` / `test`.

### Completion Notes List

- Turborepo root + `packages/*` from `create-turbo@latest` (pnpm); `apps/web` from `pnpm create next-app` with `src/`, App Router, Tailwind, ESLint; `apps/api` Fastify with `/healthz/live` and DB-aware `/healthz/ready`, safe JSON errors (no stacks to clients).
- Vitest unit tests for `toErrorBody` and health routes (`apps/api/src/server.test.ts`).
- Compose: postgres + api + web with healthchecks; multi-stage Dockerfiles with non-root users; `.env.example` + README (HTTPS note, idempotency, verification URLs).

### File List

- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `.gitignore`, `.npmrc`, `.dockerignore`
- `README.md`, `.env.example`, `docker-compose.yml`
- `packages/eslint-config/**`, `packages/typescript-config/**`, `packages/ui/**`
- `apps/web/**` (Next.js scaffold + `src/app/healthz/route.ts`, `Dockerfile`, `next.config.ts`, etc.)
- `apps/api/**` (`src/server.ts`, `src/index.ts`, `src/server.test.ts`, `Dockerfile`, `eslint.config.mjs`, `tsconfig*.json`, `vitest.config.ts`, `src/plugins/.gitkeep`)

### Change Log

- 2026-04-01: Story 1.1 implemented — Turborepo + web + api + compose + health endpoints + tests + README.
- 2026-04-01: Code review — `connectionTimeoutMillis` on `/healthz/ready` pg client; story marked done.

---

**Story completion status:** done — Code review complete; run `docker compose up --build` locally to validate container health when Docker is available.
