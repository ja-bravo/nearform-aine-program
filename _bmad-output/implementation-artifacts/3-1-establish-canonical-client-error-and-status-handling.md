# Story 3.1: Establish Canonical Client Error and Status Handling

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **legible loading and error behavior**,
so that **I always understand what the system is doing**.

## Acceptance Criteria

1. **Visible Loading and Error States**
   **Given** the todo list is being fetched from the API
   **When** the request is in-flight
   **Then** the UI shows a skeleton-style loading indicator for at least 100ms (NFR2 compliance).
   **When** the fetch fails
   **Then** the UI shows an explicit error message with the canonical error description from the server.

2. **Avoid Duplicate/Chatty Requests**
   **Given** the user navigates within the same session
   **When** the list has been recently loaded (within 60s)
   **Then** the client avoids redundant background re-fetches for the same data (NFR3 compliance).

3. **Visible Recovery Actions**
   **Given** a list load failure or mutation failure
   **When** an error is displayed
   **Then** a visible "Retry" action is available that allows the user to re-attempt the operation without refreshing the whole app (FR10).

4. **Canonical Error Envelope Integration**
   **Given** a non-OK API response
   **When** the client parses the response
   **Then** it correctly extracts and displays the `error.message` and `requestId` from the canonical envelope: `{ error: { code, message, requestId } }`.

## Tasks / Subtasks

- [x] **T1 — Shared UI components for Loading and Error** (AC: 1, 3, 4)
  - [x] Create `apps/web/src/shared/ui/loading-state.tsx` with skeleton animations.
  - [x] Create `apps/web/src/shared/ui/error-message.tsx` component with retry button and requestId display.
- [x] **T2 — Standardize `useTodosQuery` configuration** (AC: 2)
  - [x] Verify `QueryProvider` default `staleTime` (60s) is inherited.
  - [x] Ensure `useTodosQuery` correctly propagates `ApiError` instances.
- [x] **T3 — Update `TodoList` to use shared components** (AC: 1, 3, 4)
  - [x] Replace inline skeleton in `todo-list.tsx` with `<LoadingState />`.
  - [x] Replace inline error text in `todo-list.tsx` with `<ErrorMessage />` including `onRetry` callback calling `refetch()` from the query.
- [x] **T4 — Integration test for recovery path** (AC: 3, 4)
  - [x] Create `apps/web/src/features/todos/components/error-recovery.test.tsx`.
  - [x] Test: Initial load failure shows `ErrorMessage` with correct text and requestId.
  - [x] Test: Clicking "Retry" triggers a new fetch and renders todos on success.

### Review Findings (2026-04-02)

- [x] [Review][Patch] Implement mutation retry logic for Toggle/Delete actions (AC3 requirement).
- [x] [Review][Patch] Use optional chaining `data?.data?.todos` in `todo-home.tsx:59` to prevent potential null pointer crash.
- [x] [Review][Patch] Ensure `apps/web/src/shared/ui/index.tsx` is properly created and exported.
- [x] [Review][Patch] Add `.catch(() => {})` to `refetch()` in `todo-home.tsx:64` to prevent unhandled promise rejections.
- [x] [Review][Patch] Improve error extraction in `todo-home.tsx` for non-ApiError cases (AC4 compliance).
- [x] [Review][Patch] Guard against empty `errorMessage` string in `todo-list.tsx:34` to prevent rendering empty error boxes.
- [x] [Review][Patch] Add visual feedback (e.g., disable button) while retry is in progress in `ErrorMessage`.

## Dev Notes

- **Architecture Compliance:**
  - File locations: `apps/web/src/shared/ui/` for cross-feature components. [Source: architecture.md — Structure Patterns]
  - Error envelope: Parse `{ error: { code, message, requestId } }`. `fetchJson` already handles this, throwing `ApiError`. [Source: architecture.md — API Communication Patterns]
- **Source tree components to touch:**
  - `apps/web/src/features/todos/components/todo-list.tsx`
  - `apps/web/src/shared/ui/` (New directory)
- **Testing standards summary:**
  - Use `renderWithClient` to mock TanStack Query client.
  - Use `fetchMock` to simulate success/failure/retry cycles.
  - Ensure `aria-live` and `role="alert"` are used for accessibility.

### Project Structure Notes

- New folder `apps/web/src/shared/ui/` established for generic UI primitives.
- `LoadingState` and `ErrorMessage` will be the foundation for future stories (e.g., Epic 4 responsiveness).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Communication Patterns]
- [Source: apps/web/src/shared/api/fetch-json.ts]
- [Source: apps/web/src/app/query-provider.tsx]

## Dev Agent Record

### Agent Model Used

gemini-3-flash-preview

### Debug Log References

### Completion Notes List

- Implemented `LoadingState` and `ErrorMessage` shared components with skeleton animations and retry functionality.
- Verified `useTodosQuery` inherits `staleTime: 60000` from `QueryProvider`.
- Added tests for `useTodosQuery` to ensure `ApiError` propagation.
- Integrated new components into `TodoList` and `TodoHome`.
- Added comprehensive integration test for the recovery path (`error-recovery.test.tsx`).

### File List

- `apps/web/src/shared/ui/loading-state.tsx`
- `apps/web/src/shared/ui/error-message.tsx`
- `apps/web/src/shared/ui/index.tsx`
- `apps/web/src/shared/ui/loading-state.test.tsx`
- `apps/web/src/shared/ui/error-message.test.tsx`
- `apps/web/src/features/todos/hooks/use-todos-query.test.tsx`
- `apps/web/src/features/todos/components/todo-list.tsx`
- `apps/web/src/features/todos/components/todo-home.tsx`
- `apps/web/src/features/todos/components/error-recovery.test.tsx`

## Change Log

- 2026-04-02: Initial implementation of story 3.1 completed. All tasks and ACs satisfied.
