# Story 1.3: Implement Create and List Todos API contract

Status: done

## Story

As a **user** (and API client),  
I want to **create todos** and **list all todos** via a **versioned REST JSON API**,  
So that the server is the **source of truth** for titles, completion state, and **created timestamps** (FR1, FR2, FR5, FR18) with **safe validation and errors** (NFR5, NFR6).

**Traceability:** FR1, FR2, FR5, FR18 · NFR5, NFR6

## Acceptance Criteria

1. **Routes**  
   **Given** the API is running after migrations  
   **When** clients call **`POST /api/v1/todos`** and **`GET /api/v1/todos`**  
   **Then** both routes are registered under the **`/api/v1`** prefix and return JSON only.

2. **Create — success**  
   **Given** a valid JSON body (e.g. `{ "description": "Buy milk" }`)  
   **When** **`POST /api/v1/todos`** is called  
   **Then** response is **`201`** with canonical **success envelope** `{ "data": { ... } }` where the todo object uses **`camelCase`**: **`id`** (string UUID), **`description`**, **`isCompleted`**, **`createdAt`** (ISO-8601 UTC string).  
   **And** the row is persisted in **`todos`** matching the existing schema (`id`, `description`, `is_completed`, `created_at`).

3. **Create — validation**  
   **Given** missing/empty `description` or wrong types  
   **When** **`POST /api/v1/todos`** is called  
   **Then** response is **`4xx`** with canonical **error envelope** `{ "error": { "code", "message", "details?", "requestId" } }` — **no stack traces** to the client.

4. **List — success**  
   **When** **`GET /api/v1/todos`** is called  
   **Then** response is **`200`** with `{ "data": { "todos": [ ... ] } }` (or `{ "data": [ ... ] }` — **pick one shape**, document it in this story’s Dev Notes and keep **consistent** with architecture “success envelope” examples; architecture shows `{ "data": <payload> }` — a **stable array or wrapped list** is fine if documented).  
   **And** items are ordered by **`createdAt` descending** (newest first), documented in code/README.

5. **requestId**  
   **Given** any success or error response for these routes  
   **Then** **`requestId`** is present on **error** envelope per architecture; **strongly recommended** on success `meta` or response header for traceability — **minimum bar:** all **`4xx/5xx`** from these routes include **`requestId`**.

6. **Implementation structure**  
   **Given** architecture hybrid layout  
   **Then** feature code lives under **`apps/api/src/features/todos/`** (e.g. `todo-routes.ts`, `todo-repository.ts`, `todo-schemas.ts`, `todo-mappers.ts` as appropriate) and uses **`@nearform/sql`** with **parameterized** queries only in the repository layer.  
   **And** **`zod` (`4.x`)** validates **request bodies** and **response shapes** at the route boundary (or equivalent strict validation).

7. **Tests**  
   **Given** Vitest in `apps/api`  
   **Then** add tests that cover: happy-path create + list (mock repository **or** `RUN_DB_TESTS=1` integration consistent with Story 1.2), validation failure, and error envelope shape (no internal leakage).

## Tasks / Subtasks

- [x] **T1 — Dependencies** (AC: 6)  
  - [x] Add **`zod@^4`** (or exact pin per architecture) to `apps/api`.

- [x] **T2 — Request ID plugin** (AC: 5)  
  - [x] Fastify hook or `@fastify/request-id` (if allowed) to attach **`requestId`** to each request; ensure error handler includes it in `error.requestId`.

- [x] **T3 — Schemas & mappers** (AC: 2, 3, 6)  
  - [x] `todo-schemas.ts`: zod for create body, todo DTO (camelCase).  
  - [x] `todo-mappers.ts`: map DB row (`snake_case`) → API DTO (`camelCase`).

- [x] **T4 — Repository** (AC: 2, 4, 6)  
  - [x] `todo-repository.ts`: `insertTodo(description)`, `findAllTodosOrderedByCreatedAtDesc()` using **`getPool()`** from `apps/api/src/shared/db/pool.ts` and **`SQL`…``** from `@nearform/sql`.

- [x] **T5 — Routes / controller** (AC: 1–5)  
  - [x] Register **`/api/v1/todos`** in `createServer()` or via a **`registerTodosRoutes(app)`** from `features/todos`.  
  - [x] Align global `setErrorHandler` with canonical envelope + **`requestId`** for validation vs internal errors.

- [x] **T6 — Tests** (AC: 7)  
  - [x] Unit/integration tests alongside feature (e.g. `todo.integration.test.ts` or extend `server.test.ts` pattern).

- [x] **T7 — Docs**  
  - [x] README: example `curl` for create/list, response shapes, and ordering rule.

## Dev Notes

### Current schema (Story 1.2 — do not redefine)

Migrations use Postgrator **`NNN.do.<name>.sql`** / **`NNN.undo.<name>.sql`**. Table **`todos`**:

```sql
-- apps/api/migrations/001.do.create-todos.sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
description TEXT NOT NULL,
is_completed BOOLEAN NOT NULL DEFAULT false,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Index **`idx_todos_created_at`** exists (Story 1.2).

### Previous story intelligence (Story 1.2)

- **`getPool()`** / **`@nearform/sql`** in `apps/api/src/shared/db/pool.ts` — reuse for all queries.  
- **`runMigrations()`** runs before `listen` in `apps/api/src/index.ts`.  
- **`toErrorBody`** in `server.ts` today may lack **`requestId`** — **extend** for this story’s contract.  
- Opt-in DB tests: **`RUN_DB_TESTS=1`** pattern from `migration-runner.test.ts` — mirror for todo API if integration tests are used.

### Architecture compliance

- **Prefix:** `/api/v1/todos` [Source: architecture — API Naming]  
- **Success:** `{ "data": <payload>, "meta": { ...optional } }` [Source: architecture — Format Patterns]  
- **Error:** `{ "error": { "code", "message", "details?", "requestId" } }` [Source: architecture]  
- **JSON fields:** `camelCase` at API; map at repository boundary [Source: architecture — Data Exchange]  
- **No ORM:** `@nearform/sql` + parameterized queries [Source: architecture — Data Architecture]  
- **Feature-first:** `apps/api/src/features/todos/*` [Source: architecture — Structure Patterns]

### List response shape (canonical for this story)

**`GET /api/v1/todos`** success body: **`{ "data": { "todos": TodoDto[] }, "meta": { "requestId": string } }`**. Items are ordered by **`created_at` DESC** in SQL (`ORDER BY created_at DESC`), exposed as **`createdAt`** ISO-8601 UTC on each DTO.

### Out of scope

- **`PATCH`** / **`DELETE`** / toggle complete — **Epic 2**.  
- **Web UI** — **Story 1.4**.  
- **OpenAPI file generation** — optional follow-up.

### Error code suggestions (consistent naming)

- `VALIDATION_ERROR` — zod / body validation  
- `INTERNAL_ERROR` — unexpected server errors (generic message to client)

## References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.3  
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — API envelopes, naming, todos feature mapping  
- Existing code: `apps/api/src/server.ts`, `apps/api/src/index.ts`, `apps/api/src/shared/db/pool.ts`, `apps/api/migrations/*.sql`  
- Story 1.2 artifact: `_bmad-output/implementation-artifacts/1-2-create-todo-persistence-schema-and-migration-pipeline.md`  

### Review Findings

- [x] [Review][Patch] Validate full `POST` 201 success envelope with Zod (`createTodoSuccessSchema`) — matches AC6 parity with list response [`apps/api/src/features/todos/todo-schemas.ts`, `todo-routes.ts`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- T1–T7: `zod@^4`, `genReqId` + `toErrorBody(..., requestId)`, feature module under `features/todos/`, `@nearform/sql` repository, Fastify JSON parse errors mapped to `VALIDATION_ERROR` + `requestId`. List payload: `data.todos`, ordering `created_at DESC`. `closePool()` added for test isolation; `toErrorBody` moved to `shared/http/error-envelope.ts` to avoid circular imports. Vitest: mock-repo route tests + `RUN_DB_TESTS=1` integration in `todo.integration.test.ts`.

### File List

- `apps/api/package.json`
- `apps/api/src/server.ts`
- `apps/api/src/server.test.ts`
- `apps/api/src/shared/http/error-envelope.ts`
- `apps/api/src/shared/db/pool.ts`
- `apps/api/src/shared/db/migration-runner.test.ts`
- `apps/api/src/features/todos/todo-schemas.ts`
- `apps/api/src/features/todos/todo-mappers.ts`
- `apps/api/src/features/todos/todo-mappers.test.ts`
- `apps/api/src/features/todos/todo-repository.ts`
- `apps/api/src/features/todos/todo-routes.ts`
- `apps/api/src/features/todos/todo-routes.test.ts`
- `apps/api/src/features/todos/todo.integration.test.ts`
- `README.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-04-01: Story 1.3 — create/list todos API, envelopes, tests, README.
- 2026-04-02: Code review — `createTodoSuccessSchema.parse` on `POST` 201; story marked done.

---

**Story completion status:** done — Code review complete.
