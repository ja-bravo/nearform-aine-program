# Story 2.3: Build Todo Row Interactions and Visual State Distinction

Status: done

## Story

As a **user**,  
I want **obvious controls and visual cues for active vs completed tasks**,  
So that **I can scan and manage work quickly** (FR3, FR4, FR6, FR18) with **honest persistence feedback** (NFR1, NFR9).

**Traceability:** FR3, FR4, FR6, FR18 · NFR1, NFR9

## Acceptance Criteria

1. **Active/completed visual distinction**  
   **Given** a list containing both active and completed todos  
   **When** the list renders  
   **Then** completed rows are visually distinct from active rows — minimum: strikethrough text, muted color — with no ambiguity about state at a glance.

2. **Toggle completion — happy path**  
   **Given** an active or completed todo row  
   **When** the user clicks/activates the completion checkbox  
   **Then** the checkbox shows a pending state immediately while the `PATCH /api/v1/todos/:id` call is in-flight, and the list reconciles to server truth after success (via query invalidation).

3. **Toggle completion — failure**  
   **Given** a todo row in the middle of a completion toggle  
   **When** the `PATCH` call fails (network or server error)  
   **Then** the row shows explicit inline failure text (e.g., "Failed to update") — it does NOT silently revert and it does NOT show a fake success state.

4. **Delete — happy path**  
   **Given** a todo row  
   **When** the user activates the delete button  
   **Then** the row is removed from the list after `DELETE /api/v1/todos/:id` succeeds (via query invalidation) — the button shows a pending state while the request is in-flight.

5. **Delete — failure**  
   **Given** a todo row during a delete attempt  
   **When** the `DELETE` call fails  
   **Then** the row shows explicit inline failure text (e.g., "Failed to delete") — the row is NOT removed from the list on failure.

6. **Concurrent protection**  
   **Given** a pending mutation on a row  
   **When** the same row's controls are still visible  
   **Then** both the completion checkbox and delete button are disabled for that row while the mutation is in-flight to prevent duplicate submissions.

7. **Accessibility**  
   **Given** assistive technology or keyboard-only use  
   **When** interacting with todo row controls  
   **Then** the completion checkbox has an accessible label describing the current state (e.g., "Mark 'Buy milk' as complete"), the delete button has an accessible label (e.g., "Delete 'Buy milk'"), and both controls are keyboard-operable.

8. **Persistence reconciliation**  
   **Given** a successful completion toggle or delete  
   **When** the list refreshes from the server  
   **Then** the displayed UI state matches server truth — no stale/phantom items remain.

## Tasks / Subtasks

- [x] **T1 — `use-complete-todo-mutation` hook** (AC: 2, 3, 6, 8)
  - [x] Create `apps/web/src/features/todos/hooks/use-complete-todo-mutation.ts`
  - [x] Use `useMutation` from TanStack Query; `mutationFn` calls `PATCH /api/v1/todos/:id` with `{ isCompleted: boolean }` body using `fetchJson` + `createTodoResponseSchema`
  - [x] On success: `void queryClient.invalidateQueries({ queryKey: ["todos"] })`
  - [x] No automatic retry (matching existing mutation pattern)

- [x] **T2 — `use-delete-todo-mutation` hook** (AC: 4, 5, 6, 8)
  - [x] Create `apps/web/src/features/todos/hooks/use-delete-todo-mutation.ts`
  - [x] Use `useMutation`; `mutationFn` calls `DELETE /api/v1/todos/:id` using `fetchJson` with `z.null()` as schema (handles 204 No Content — see Dev Notes)
  - [x] On success: `void queryClient.invalidateQueries({ queryKey: ["todos"] })`

- [x] **T3 — `TodoItemRow` component** (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Create `apps/web/src/features/todos/components/todo-item-row.tsx`
  - [x] Props: `{ todo: TodoDto }` — hooks called internally (same pattern as `QuickCaptureBar`)
  - [x] Renders: checkbox (completion control), task text, `createdAt` metadata, delete button, inline error area
  - [x] Active state: normal text weight, full color
  - [x] Completed state: `line-through` on description text, muted text color (e.g., `text-zinc-400`)
  - [x] Both controls disabled while `isPending` is true on either mutation
  - [x] Inline error shown on mutation failure — does NOT auto-dismiss or auto-revert
  - [x] Accessible labels on checkbox and delete button (include todo description in the label)

- [x] **T4 — Update `TodoList` to use `TodoItemRow`** (AC: 1, 2, 3, 4, 5, 6, 7, 8)
  - [x] Edit `apps/web/src/features/todos/components/todo-list.tsx`
  - [x] Replace the inline `<li>` block with `<TodoItemRow key={todo.id} todo={todo} />`
  - [x] Remove the now-unused `disabled` checkbox and static li markup
  - [x] Keep `isLoading`, `loadFailed`, and empty state behavior unchanged

- [x] **T5 — Tests** (AC: 1–8)
  - [x] Create `apps/web/src/features/todos/components/todo-item-row.test.tsx`
  - [x] Use `renderWithClient` wrapper pattern (same as `quick-capture-bar.test.tsx`)
  - [x] Test: completed todo renders `line-through` style (check for CSS class or computed style)
  - [x] Test: clicking checkbox calls `PATCH` with correct URL and body
  - [x] Test: checkbox is disabled while PATCH is pending
  - [x] Test: PATCH failure shows inline error text, does not remove the row
  - [x] Test: clicking delete button calls `DELETE` with correct URL
  - [x] Test: delete button is disabled while DELETE is pending
  - [x] Test: DELETE failure shows inline error text, row remains in DOM
  - [x] Test: checkbox has accessible label mentioning the todo description
  - [x] Test: delete button has accessible label mentioning the todo description

## Dev Notes

### Architecture Compliance

- **File locations:** All new files in `apps/web/src/features/todos/hooks/` and `apps/web/src/features/todos/components/` — no exceptions [Source: architecture.md — Structure Patterns]
- **Component naming:** PascalCase files (`TodoItemRow.tsx` → wrong; `todo-item-row.tsx` → correct) [Source: architecture.md — Naming Patterns]
- **Hooks naming:** `use-complete-todo-mutation.ts`, `use-delete-todo-mutation.ts` (kebab-case) [Source: architecture.md — Naming Patterns]
- **No new API layer code** — `fetchJson` and `ApiError` already exist in `apps/web/src/shared/api/`; do NOT create duplicates
- **State truth model:** Never show completion success until server confirms — use `invalidateQueries` for reconciliation, not optimistic local state [Source: architecture.md — State Management Patterns, Frontend Architecture]
- **Write retries are user-initiated** — do NOT add `retry: N` to mutation config [Source: architecture.md — State Management Patterns]
- **No auto-retry loops** — mutation config stays `retry: false` consistent with existing hooks

### PATCH Endpoint (Complete/Uncomplete)

**Already implemented in Story 2.1.** Reuse `createTodoResponseSchema` for response parsing (same `{ data: TodoDto, meta?: {...} }` shape):

```http
PATCH /api/v1/todos/:id
Content-Type: application/json
{ "isCompleted": true }
```

**Success (200):**
```json
{ "data": { "id": "...", "description": "...", "isCompleted": true, "createdAt": "..." }, "meta": { "requestId": "..." } }
```

**Import reuse:** `createTodoResponseSchema` is already exported from `apps/web/src/shared/api/schemas.ts` — do NOT define a new schema.

### DELETE Endpoint

**Already implemented in Story 2.2.** Returns `204 No Content` (no body):

```http
DELETE /api/v1/todos/:id
```

**Success: `204 No Content`** — empty body.

**Critical:** `fetchJson` in `apps/web/src/shared/api/fetch-json.ts` always calls `schema.safeParse(json)`. For 204 responses, `text` is empty so `json = null`. Pass `z.null()` as the schema — `z.null().safeParse(null)` returns success:

```typescript
// In use-delete-todo-mutation.ts:
import { z } from "zod";
// ...
mutationFn: (id: string) =>
  fetchJson(`/api/v1/todos/${id}`, { method: "DELETE" }, z.null()),
```

Do NOT create a `fetchVoid` helper or modify `fetch-json.ts` — `z.null()` solves this cleanly.

### Hook Implementation Pattern

Model directly after `apps/web/src/features/todos/hooks/use-create-todo-mutation.ts`:

```typescript
// use-complete-todo-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";
import { createTodoResponseSchema } from "@/shared/api/schemas";

export function useCompleteTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      fetchJson(
        `/api/v1/todos/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isCompleted }),
        },
        createTodoResponseSchema
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

```typescript
// use-delete-todo-mutation.ts
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/todos/${id}`, { method: "DELETE" }, z.null()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

### TodoItemRow Component Design

The component calls both mutation hooks internally — same pattern as `QuickCaptureBar` calling `useCreateTodoMutation()` directly.

**Key behaviors to implement:**
1. `isPending` from either mutation disables both controls for that row
2. Error shown inline (use `ApiError` class to extract message, same as `quick-capture-bar.tsx:32-37`)
3. Two separate mutation instances per row (one for complete, one for delete) — TanStack Query handles this correctly

**Completed state styling:**
- Description text: add `line-through text-zinc-500 dark:text-zinc-400` when `todo.isCompleted`
- Row background: optionally slightly muted (e.g., `bg-zinc-50 dark:bg-zinc-900/50` instead of `bg-white`)

**Active vs completed checkbox:**
- Remove `disabled` prop from checkbox (current `todo-list.tsx:68` has it disabled — remove this)
- Attach `onChange` to call `completeMutation.mutate({ id: todo.id, isCompleted: !todo.isCompleted })`

**Accessible labels pattern:**
```tsx
// Checkbox
aria-label={`Mark '${todo.description}' as ${todo.isCompleted ? "active" : "complete"}`}

// Delete button
aria-label={`Delete '${todo.description}'`}
```

**Inline error display:**
```tsx
{(completeMutation.isError || deleteMutation.isError) && (
  <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
    {completeMutation.isError ? "Failed to update" : "Failed to delete"}
  </p>
)}
```

### TodoList Update

In `apps/web/src/features/todos/components/todo-list.tsx`, the `return` block (line 60-86) currently contains an inline `<li>` with a disabled checkbox. Replace it:

```tsx
// Replace the map block:
{todos.map((todo) => (
  <TodoItemRow key={todo.id} todo={todo} />
))}
```

Remove the `formatCreatedAt` helper and `Intl.DateTimeFormat` from `todo-list.tsx` — move it to `todo-item-row.tsx` where it will be used. (Or keep it in `todo-list.tsx` and import it — but since `TodoList` won't render dates directly anymore, moving it is cleaner.)

### Test Implementation Pattern

Mirror `apps/web/src/features/todos/components/quick-capture-bar.test.tsx` exactly:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TodoItemRow } from "./todo-item-row";

const fixedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const activeTodo = {
  id: fixedId,
  description: "Buy milk",
  isCompleted: false,
  createdAt: "2026-04-01T12:00:00.000Z",
};
const completedTodo = { ...activeTodo, isCompleted: true };

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}
```

**Key test cases:**
```
it("applies line-through class to description of completed todo")
it("does NOT apply line-through class to active todo description")
it("calls PATCH with correct id and isCompleted:true when toggling active todo")
it("calls PATCH with correct id and isCompleted:false when toggling completed todo")
it("disables controls while PATCH is pending")
it("shows inline error text when PATCH fails, does not remove row")
it("calls DELETE with correct id when delete button clicked")
it("disables controls while DELETE is pending")
it("shows inline error text when DELETE fails, row remains in DOM")
it("checkbox has accessible label mentioning todo description")
it("delete button has accessible label mentioning todo description")
```

**Mock PATCH call:**
```typescript
fetchMock.mockResolvedValueOnce(
  new Response(
    JSON.stringify({
      data: { id: fixedId, description: "Buy milk", isCompleted: true, createdAt: "2026-04-01T12:00:00.000Z" },
      meta: { requestId: "rid-1" },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
);
```

**Mock DELETE call (204 No Content):**
```typescript
fetchMock.mockResolvedValueOnce(
  new Response(null, { status: 204 })
);
```

**Mock failure:**
```typescript
fetchMock.mockResolvedValueOnce(
  new Response(
    JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Server error", requestId: "rid-2" } }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  )
);
```

### Project Structure Notes

**Files to create (NEW):**

| File | Purpose |
|------|---------|
| `apps/web/src/features/todos/hooks/use-complete-todo-mutation.ts` | PATCH mutation hook |
| `apps/web/src/features/todos/hooks/use-delete-todo-mutation.ts` | DELETE mutation hook |
| `apps/web/src/features/todos/components/todo-item-row.tsx` | Interactive todo row component |
| `apps/web/src/features/todos/components/todo-item-row.test.tsx` | Tests for TodoItemRow |

**Files to edit (EXISTING):**

| File | Change |
|------|--------|
| `apps/web/src/features/todos/components/todo-list.tsx` | Replace inline `<li>` with `<TodoItemRow>`, remove `disabled` checkbox |

**Files NOT to touch:**
- `apps/web/src/shared/api/fetch-json.ts` — no changes needed; `z.null()` schema handles 204
- `apps/web/src/shared/api/schemas.ts` — no new schemas; reuse `createTodoResponseSchema`
- `apps/web/src/shared/api/api-error.ts` — no changes
- `apps/web/src/features/todos/hooks/use-todos-query.ts` — no changes
- `apps/web/src/features/todos/components/todo-home.tsx` — no changes; `TodoList` props remain identical
- `apps/web/src/features/todos/components/quick-capture-bar.tsx` — no changes
- All API files (`apps/api/`) — this story is purely frontend

### Previous Story Intelligence

**From Story 2.2 (last completed):**
- `DELETE /api/v1/todos/:id` returns `204 No Content` — **no body** — confirmed working
- Pattern for reusing existing schemas: `paramIdSchema` was reused; similarly reuse `createTodoResponseSchema` for PATCH
- Review finding: always validate IDs at route level — already done in 2.1/2.2; frontend just passes the id from the `TodoDto`

**From Story 2.1:**
- `PATCH /api/v1/todos/:id` body is `{ isCompleted: boolean }` (camelCase, not `is_completed`)
- Response envelope is `{ data: TodoDto, meta: { requestId } }` — same as create
- `updateTodoCompletion` in the API uses `rowCount` null-safety (`?? 0`) — irrelevant to frontend but confirms the contract

**From Story 1.4 (UI baseline):**
- `TodoList` receives `todos: TodoDto[]`, `isLoading: boolean`, `loadFailed: boolean` — **these props must not change**
- `todo-home.tsx` passes `data?.data.todos ?? []` — shape unchanged after this story
- Tailwind dark mode classes follow the `dark:` prefix pattern established throughout the codebase
- `"use client"` directive required on any component using hooks
- The `renderWithClient` test wrapper pattern with `QueryClient` + `retry: false` is established — use it exactly

### Styling Reference (Existing Patterns)

Use existing Tailwind class patterns from the codebase for consistency:

| Purpose | Existing classes | Source |
|---------|-----------------|--------|
| Row border/bg | `border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950` | `todo-list.tsx:65` |
| Metadata text | `text-xs text-zinc-500 dark:text-zinc-400` | `todo-list.tsx:79` |
| Primary button | `bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60` | `quick-capture-bar.tsx:85` |
| Error text | `text-sm text-red-600 dark:text-red-400` | `quick-capture-bar.tsx:73` |
| Focus ring | `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` | `quick-capture-bar.tsx:86` |
| Completed text | `line-through text-zinc-400 dark:text-zinc-500` | (new — follow zinc scale) |

### Out of Scope

- `PersistenceStatusBadge` component (`Saving` / `Saved` / `Not saved` labels) — this is Epic 3 (Story 3.2)
- `RetryInlineAction` component — Epic 3 (Story 3.3)
- `OfflineReadOnlyBanner` — Epic 3 (Story 3.4)
- Inline retry on the row error state — a simple error message is sufficient; retry button deferred to Story 3.3
- Sorting completed todos to bottom of list — not specified in AC; keep server list order
- Optimistic updates — architecture prohibits silent auto-revert patterns
- Bulk delete or multi-select
- Any API changes

### References

| Document | Section | Usage |
|----------|---------|-------|
| Epics | Story 2.3 | Acceptance criteria, FR/NFR traceability |
| Architecture | Frontend Architecture | TanStack Query, no-optimistic-update policy, mutation state model |
| Architecture | Naming Patterns | File naming, component naming |
| Architecture | Structure Patterns | File location constraints |
| Architecture | State Management Patterns | User-initiated retry, no silent loops |
| UX Spec | Component Strategy — `TodoItemRow` | States, anatomy, accessibility, interaction behavior |
| UX Spec | UX Consistency Patterns — Feedback | `Saving` / `Not saved` lifecycle (simplified for this story) |
| UX Spec | Visual Design — Color System | Semantic color tokens for success/error |
| Story 2.2 Dev Notes | Route Handler, API Contract | DELETE 204 response contract |
| Story 2.1 Dev Notes | Route Handler, API Contract | PATCH response shape |
| Story 1.4 | TodoList, TodoHome | Existing props contract and UI baseline |
| `apps/web/src/features/todos/hooks/use-create-todo-mutation.ts` | Full file | Mutation hook pattern to replicate |
| `apps/web/src/features/todos/components/quick-capture-bar.tsx` | Full file | `ApiError` error handling, mutation state, disabled pattern |
| `apps/web/src/features/todos/components/quick-capture-bar.test.tsx` | Full file | Test wrapper, fetch mock, userEvent pattern |
| `apps/web/src/shared/api/fetch-json.ts` | Lines 28-52 | Why `z.null()` works for 204 responses |

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Created `use-complete-todo-mutation.ts` — TanStack `useMutation` hook calling `PATCH /api/v1/todos/:id` with `fetchJson` + `createTodoResponseSchema`. Invalidates `["todos"]` on success. No retry, matching existing mutation pattern.
- Created `use-delete-todo-mutation.ts` — TanStack `useMutation` hook calling `DELETE /api/v1/todos/:id` with `fetchJson` + `z.null()` schema (handles 204 No Content empty body). Invalidates `["todos"]` on success.
- Created `TodoItemRow` component — renders checkbox (interactive, `onChange` calls complete mutation), description text (line-through + muted color when completed), `createdAt` metadata, delete button, and inline error `<p role="alert">`. Both controls disabled while `isPending` from either mutation. Accessible `aria-label` on both controls includes todo description.
- Updated `TodoList` — removed inline `<li>` block and unused `formatCreatedAt` helper; now renders `<TodoItemRow key={todo.id} todo={todo} />`. `isLoading`, `loadFailed`, and empty state unchanged.
- 11 tests in `todo-item-row.test.tsx` — all pass. Covers: line-through on completed, no line-through on active, PATCH called with correct id+isCompleted (both toggle directions), controls disabled during PATCH pending, PATCH failure shows alert + row remains, DELETE called with correct id, controls disabled during DELETE pending, DELETE failure shows alert + row remains, checkbox aria-label, delete button aria-label.
- All 17 web tests pass. No regressions.

### File List

- `apps/web/src/features/todos/hooks/use-complete-todo-mutation.ts` — new file
- `apps/web/src/features/todos/hooks/use-delete-todo-mutation.ts` — new file
- `apps/web/src/features/todos/components/todo-item-row.tsx` — new file
- `apps/web/src/features/todos/components/todo-item-row.test.tsx` — new file
- `apps/web/src/features/todos/components/todo-list.tsx` — replaced inline li with TodoItemRow, removed formatCreatedAt

### Review Findings

- [x] [Review][Patch] URL encoding for todo ID in mutation hooks [use-complete-todo-mutation.ts:10]
- [x] [Review][Patch] Error masking when multiple mutations fail [todo-item-row.tsx:41]
- [x] [Review][Patch] Potential crash on invalid `createdAt` date string [todo-item-row.tsx:14]
- [x] [Review][Patch] Missing safety for `todos` prop in `TodoList` [todo-list.tsx:54]
- [x] [Review][Patch] Ambiguous aria-label for empty todo descriptions [todo-item-row.tsx:53]
- [x] [Review][Patch] Inefficient date formatting in `TodoItemRow` [todo-item-row.tsx:14]
- [x] [Review][Patch] DRY violation for date formatting logic [todo-item-row.tsx]
- [x] [Review][Patch] Hardcoded API paths in hooks [use-complete-todo-mutation.ts]
- [x] [Review][Patch] Weak assertions in tests using `toContain` [todo-item-row.test.tsx]
- [x] [Review][Patch] Low-level `fetch` mocks in tests [todo-item-row.test.tsx]
- [x] [Review][Defer] Missing delete confirmation dialog [todo-item-row.tsx] — deferred, pre-existing
- [x] [Review][Defer] Error handling visibility (notification system) [todo-item-row.tsx] — deferred, pre-existing
