# Story 2.2: Implement Delete Todo API with Safe Error Handling

Status: done

## Story

As a **user**,  
I want to **delete tasks I no longer need**,  
So that **my list stays focused and clean** (FR4, FR9, FR18) with **safe, consistent errors** (NFR5, NFR6).

**Traceability:** FR4, FR9, FR18 · NFR5, NFR6

## Acceptance Criteria

1. **Delete existing todo**  
   **Given** an existing todo with known `id`  
   **When** **`DELETE /api/v1/todos/:id`** is called  
   **Then** response is **`204 No Content`** with no body — item is removed from the database.

2. **Persistence confirmation**  
   **Given** a successful `204` delete response  
   **When** **`GET /api/v1/todos`** is called immediately after  
   **Then** the deleted item is **no longer present** in the list — no stale data.

3. **Non-existent ID — predictable status**  
   **Given** a request to delete a **non-existent** todo `id`  
   **When** **`DELETE /api/v1/todos/:id`** is called  
   **Then** response is **`404`** with canonical **error envelope** including `code: "NOT_FOUND"`, a human-readable message, and the **`requestId`** — no stack traces, no internal paths.

4. **Idempotent behavior**  
   **Given** the same todo `id` is deleted twice  
   **When** both `DELETE` requests are sent sequentially  
   **Then** first call returns `204`, second call returns `404 NOT_FOUND` — **no corruption of system state**, no duplicate errors, no 500s.

5. **Invalid UUID format**  
   **Given** a path param that is not a valid UUID (e.g., `"abc"`, `"123"`)  
   **When** **`DELETE /api/v1/todos/:id`** is called  
   **Then** response is **`400`** with **error envelope** including `code: "VALIDATION_ERROR"` — request is rejected before hitting the database.

6. **Safe error responses**  
   **Given** any error condition (not found, validation, unexpected)  
   **When** **`DELETE /api/v1/todos/:id`** returns an error response  
   **Then** **no stack traces, internal paths, or DB details** appear in the response body — error envelope always includes `requestId`.

7. **Performance compliance**  
   **Given** single-user use and typical network conditions  
   **When** a delete request is submitted and server response is received  
   **Then** total request/response cycle completes **within 500 ms p95** [NFR1].

## Tasks / Subtasks

- [x] **T1 — Repository method** (AC: 1, 2, 4)
  - [x] Add `deleteTodo(id: string): Promise<boolean>` to `TodoRepository` interface in `todo-repository.ts`.
  - [x] Implement using **`@nearform/sql`** with parameterized query: `DELETE FROM todos WHERE id = $1`.
  - [x] Use `result.rowCount` to determine outcome: `rowCount === 1` → return `true` (deleted); `rowCount === 0` → return `false` (not found).
  - [x] Wrap in try-catch with error re-throw wrapping (same pattern as `updateTodoCompletion`).

- [x] **T2 — Route handler** (AC: 1, 3, 4, 5, 6)
  - [x] Register **`DELETE /:id`** route in `todo-routes.ts` (inside the existing `registerTodosRoutes` scope with prefix `/api/v1/todos`).
  - [x] Validate `request.params.id` via **existing `paramIdSchema`** (reuse from `todo-schemas.ts`) → 400 on invalid UUID.
  - [x] Call `repo.deleteTodo(id)`.
  - [x] On `true`: return `reply.status(204).send()` — **no body**.
  - [x] On `false`: return 404 with `toErrorBody(404, "Todo not found", request.id, { code: "NOT_FOUND" })`.
  - [x] **No new schemas needed** — `paramIdSchema` already exists; delete has no request body.

- [x] **T3 — Tests** (AC: 1–7)
  - [x] Add `deleteTodo: vi.fn(...)` to `mockRepo()` in `todo-routes.test.ts`.
  - [x] Update `TodoRepository` mock type to include `deleteTodo`.
  - [x] Happy path: DELETE existing id → 204, no body.
  - [x] Not found: DELETE non-existent id → 404 with NOT_FOUND error envelope.
  - [x] Invalid UUID: DELETE non-UUID → 400 VALIDATION_ERROR.
  - [x] Idempotency: first DELETE → 204, second DELETE (mock returns false) → 404.
  - [x] No stack trace: confirm error responses do not expose internals.
  - [x] Performance baseline: measure route latency < 500 ms.

- [x] **T4 — Documentation** (AC: 1, 3, 6)
  - [x] Update `README.md` with DELETE endpoint example (curl, success response 204, error 404 envelope).

### Review Findings

- [x] [Review][Patch] Missing try/catch in DELETE route handler — `repo.deleteTodo` throws propagate unhandled; `todo-repository.ts` catch embeds raw DB message in the re-thrown Error, potentially leaking it in 500 responses (violates AC6) [`apps/api/src/features/todos/todo-routes.ts`, `apps/api/src/features/todos/todo-repository.ts`]
- [x] [Review][Patch] No test covers `deleteTodo` throwing — 500 error shape, message-leak prevention, and requestId in envelope are unverified for the unexpected-error path (AC6) [`apps/api/src/features/todos/todo-routes.test.ts`]
- [x] [Review][Patch] "Idempotency" test is misnamed — labels the correct 404-on-second-delete as "idempotent", misleading future developers on API contract [`apps/api/src/features/todos/todo-routes.test.ts`]
- [x] [Review][Patch] `"at "` stack-trace check is a weak string match testing the wrong failure mode (404 path, not thrown-error path) — analogous POST test uses a specific message string instead [`apps/api/src/features/todos/todo-routes.test.ts`]
- [x] [Review][Defer] Performance test uses in-process mock — cannot detect real DB/network latency regressions; pre-existing pattern across full test suite — deferred, pre-existing
- [x] [Review][Defer] No Fastify response schema for DELETE route — 204 Content-Type header behaviour undefined; consistent with all other routes — deferred, pre-existing
- [x] [Review][Defer] No integration test for AC2 persistence confirmation (GET after DELETE) — requires DB integration infrastructure not present in this test suite — deferred, pre-existing

## Dev Notes

### Architecture Compliance

- **Endpoint pattern:** `DELETE /api/v1/todos/:id` [Source: architecture — API Naming]
- **Success:** `204 No Content`, **no body** — delete semantics do not require response payload
- **Not found:** `404` with canonical error envelope `{ "error": { "code": "NOT_FOUND", "message": "Todo not found", "requestId": "..." } }` [Source: architecture — Format Patterns]
- **Invalid UUID:** `400` with `{ "error": { "code": "VALIDATION_ERROR", ... } }` — validated before DB hit [Source: architecture — Error Handling]
- **No ORM:** Use `@nearform/sql` parameterized queries only; never raw SQL concatenation [Source: architecture — Data Architecture]
- **Feature structure:** Code lives in `apps/api/src/features/todos/` — **no new files**, only edits to existing `todo-repository.ts`, `todo-routes.ts`, `todo-routes.test.ts` [Source: architecture — Structure Patterns]
- **Performance target:** Request/response within 500 ms p95 [NFR1]

### Previous Story Intelligence (Story 2.1)

**Established patterns — reuse exactly:**

- **`paramIdSchema`** (`z.object({ id: z.uuid() })`) already in `todo-schemas.ts:50` — reuse for DELETE UUID validation (same as PATCH)
- **`toErrorBody()`** in `apps/api/src/shared/http/error-envelope.ts` — use for 404 NOT_FOUND response
- **`flattenError()`** NOT needed for DELETE (no request body to validate beyond UUID param)
- **Repository pattern:** `updateTodoCompletion()` in `todo-repository.ts:54-76` — reuse the try-catch + `@nearform/sql` pattern for `deleteTodo()`
- **Route pattern:** PATCH `/:id` handler in `todo-routes.ts:59-112` — reuse UUID param validation → repo call → 404 on null/false pattern for DELETE
- **Test `mockRepo()` function** in `todo-routes.test.ts:9-24` — extend with `deleteTodo: vi.fn(async () => true)` default; override to return `false` for not-found tests
- **Test server setup:** `createServer({ todoRepository: repo })` + `app.inject()` — same injection pattern throughout

**Review findings from 2.1 that apply here:**
- UUID validation MUST happen at route level before the repo call (was missing initially in 2.1, fixed in review) — implement correctly from the start
- Error message for 404 must be sanitized — do not include the id in the message (story 2.1 was fixed to use `"Todo not found"` without the ID to avoid leaking)
- Missing database error handling in repository was a review finding in 2.1 — add try-catch with error wrapping in `deleteTodo()` from the start

### Repository Implementation

```typescript
// Add to TodoRepository type interface:
deleteTodo(id: string): Promise<boolean>;

// Add to createTodoRepository() return object:
async deleteTodo(id: string): Promise<boolean> {
  const pool = getPool();
  const statement = SQL`
    DELETE FROM todos WHERE id = ${id}
  `;
  try {
    const result = await pool.query({
      text: statement.text,
      values: statement.values,
    });
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    throw new Error(
      `Failed to delete todo: ${error instanceof Error ? error.message : String(error)}`
    );
  }
},
```

**Note:** `result.rowCount` may be `null` on some pg versions — use `?? 0` guard (same as in `updateTodoCompletion` null-safety pattern).

### Route Handler Implementation

```typescript
scope.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
  const paramParsed = paramIdSchema.safeParse({ id: request.params.id });
  if (!paramParsed.success) {
    return reply.status(400).send(
      toErrorBody(400, "Invalid todo ID format", request.id, {
        code: "VALIDATION_ERROR",
        details: { id: "Must be a valid UUID" },
      })
    );
  }
  const deleted = await repo.deleteTodo(paramParsed.data.id);
  if (!deleted) {
    return reply.status(404).send(
      toErrorBody(404, "Todo not found", request.id, { code: "NOT_FOUND" })
    );
  }
  return reply.status(204).send();
});
```

**Critical:** No try-catch needed in the route handler for the delete itself — the repository already wraps errors and Fastify's `setErrorHandler` in `server.ts:31-51` catches unhandled throws and returns a safe 500 envelope (confirmed by existing `"error envelope"` test in `todo-routes.test.ts:163-190`).

### Test Implementation Guide

Extend `mockRepo()` default in `todo-routes.test.ts`:
```typescript
deleteTodo: vi.fn(async () => true),  // default: item found and deleted
```

Add a `describe("DELETE /api/v1/todos/:id", ...)` block matching the existing describe structure:

```
it("returns 204 with no body on successful delete")
it("returns 404 NOT_FOUND with error envelope when todo not found")
it("returns 400 VALIDATION_ERROR for invalid UUID format")
it("verifies idempotency: second delete of same id returns 404")
it("does not expose stack traces in error responses")
it("performance baseline: DELETE completes within 500ms")
```

Use same `fixedId` and `fixedDate` constants already defined at top of test file.

### Database Schema Notes

**No migration needed** — `DELETE FROM todos WHERE id = $1` operates on the existing `todos` table from Story 1.2:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

PostgreSQL `DELETE` on a non-existent UUID returns `rowCount = 0` (not an error) — this is how we detect "not found" without an extra SELECT.

### API Contract Reference

**Request:**
```http
DELETE /api/v1/todos/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
```

**Success Response (204):**
```
HTTP/1.1 204 No Content
```
_(No body)_

**Not Found Response (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Todo not found",
    "requestId": "req-12345abcde"
  }
}
```

**Invalid UUID Response (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid todo ID format",
    "details": { "id": "Must be a valid UUID" },
    "requestId": "req-12345abcde"
  }
}
```

### Files to Modify

| File | Change |
|------|--------|
| `apps/api/src/features/todos/todo-repository.ts` | Add `deleteTodo()` to interface and implementation |
| `apps/api/src/features/todos/todo-routes.ts` | Add `DELETE /:id` handler inside existing scope |
| `apps/api/src/features/todos/todo-routes.test.ts` | Add `deleteTodo` to mockRepo, add DELETE test suite |
| `README.md` | Add DELETE endpoint documentation |

**Files NOT to modify:**
- `todo-schemas.ts` — `paramIdSchema` already exists; no new schemas needed
- `todo-mappers.ts` — no DTO mapping needed (204 has no body)
- `error-envelope.ts` — already supports `NOT_FOUND` code
- `migrations/` — no schema changes needed

### Out of Scope

- Soft deletes or tombstone pattern (hard delete only for v1)
- Bulk delete (single item per request)
- Cascade logic (only one table with no relations in v1)
- Audit logging or deletion history
- Web UI implementation (covered by Story 2.3)

### Related Specifications

- **Epics document:** `_bmad-output/planning-artifacts/epics.md` — Story 2.2 requirements
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` — API patterns, error handling, naming conventions
- **Previous story:** `_bmad-output/implementation-artifacts/2-1-implement-complete-uncomplete-api-and-state-mapping.md` — established route/repo/test patterns

## References

| Document | Section | Usage |
|----------|---------|-------|
| Epics | Story 2.2 — Delete Todo | Functional requirements, acceptance criteria, FRs/NFRs |
| Architecture | API Patterns | Error envelope, success envelope, request ID handling |
| Architecture | Data Architecture | `@nearform/sql`, parameterized queries, naming conventions |
| Story 2.1 | Dev Notes / File List | Established patterns for route/repo/test; `paramIdSchema` reuse |
| Story 1.2 | Schema | Todos table definition — no migration needed |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes

- Added `deleteTodo(id: string): Promise<boolean>` to `TodoRepository` interface and implementation in `todo-repository.ts`. Uses `@nearform/sql` parameterized query with `rowCount ?? 0` null-safety guard and try-catch error wrapping matching the `updateTodoCompletion` pattern.
- Added `DELETE /:id` route handler to `todo-routes.ts` inside the existing scope. Reuses `paramIdSchema` for UUID validation (400 on invalid format), calls `repo.deleteTodo()`, returns `204` on success and `404 NOT_FOUND` when the item does not exist. No request body parsing needed.
- Added 6 tests in `todo-routes.test.ts` covering: 204 happy path, 404 NOT_FOUND envelope, 400 VALIDATION_ERROR for non-UUID, idempotency (first 204, second 404), no stack trace in error responses, and performance baseline < 500 ms. Extended `mockRepo()` default with `deleteTodo: vi.fn(async () => true)`.
- Updated `README.md` with DELETE endpoint documentation including curl example, 204 success, 404 NOT_FOUND envelope, and 400 VALIDATION_ERROR envelope.
- All 32 tests pass (including 21 route tests). No regressions introduced.

### File List

- `apps/api/src/features/todos/todo-repository.ts` — added `deleteTodo` to interface and implementation
- `apps/api/src/features/todos/todo-routes.ts` — added `DELETE /:id` route handler
- `apps/api/src/features/todos/todo-routes.test.ts` — added `deleteTodo` to mockRepo, added DELETE test suite (6 tests)
- `README.md` — added DELETE endpoint documentation

### Change Log

- 2026-04-02: Implemented Story 2.2 — Delete Todo API with safe error handling. Added repository method, route handler, tests, and README docs.
