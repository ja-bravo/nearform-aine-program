# Story 3.3: Add Inline Retry for Failed Item Persistence

Status: done

<!-- Note: This story is created by the BMad Method story-creation workflow. -->

## Story

As a **user**,
I want to **retry failed saves directly where they failed**,
so that **I can recover quickly without losing context**.

## Acceptance Criteria

1. **[AC1] Item-Level Retry Execution**
   - When a todo action (create, toggle, delete) fails and shows "Not saved", a "Retry" action is available.
   - Selecting "Retry" re-triggers only that specific mutation.
   - On success, the item transitions to `Saved` and follows the standard feedback lifecycle (3-second timeout).
   - retry operations must use the same data as the original failed request.

2. **[AC2] In-Flight Guardrails**
   - The "Retry" button/action is disabled while the retry mutation is in-flight (`isPending`).
   - The `PersistenceStatusBadge` correctly shows `saving` during the retry attempt.
   - Prevents duplicate write submissions if the user clicks multiple times.

3. **[AC3] Actionable Guidance & Persistence**
   - Failed items remain visible in the list with their last known user-intended state.
   - Error messages provide clear guidance (e.g., "Network error. Please try again.") instead of generic "Failed".
   - If a retry fails repeatedly, the "Not saved" state and "Retry" option persist.

4. **[AC4] Quick Capture Recovery**
   - In `QuickCaptureBar`, if a create fails, the "Retry" button allows re-submitting the current input text.
   - The input field is NOT cleared on failure, preserving the user's work.

## Tasks / Subtasks

- [x] **T1 — Enhance `TodoItemRow` Retry Logic** (AC1, AC2, AC3)
  - [x] Update `TodoItemRow.tsx` to disable the "Retry" button when `isPending` is true.
  - [x] Ensure `handleRetryToggle` and `handleRetryDelete` are robust and map correctly to the individual mutation states.
  - [x] Improve error messaging to be more descriptive (use `ApiError` details if available).

- [x] **T2 — Enhance `QuickCaptureBar` Retry Logic** (AC2, AC4)
  - [x] Update `QuickCaptureBar.tsx` to disable the "Retry" button when `isPending` is true.
  - [x] Verify that the input field content is preserved on failure.
  - [x] Ensure the "Retry" button triggers the mutation with the current input value.

- [x] **T3 — Integration Tests for Retry Behavior** (AC1, AC2, AC3, AC4)
  - [x] Create `apps/web/src/features/todos/components/inline-retry.test.tsx`.
  - [x] Test: Clicking "Retry" on a failed toggle disables the button and eventually shows `Saved`.
  - [x] Test: Clicking "Retry" on a failed delete disables the button and eventually removes the item (if success).
  - [x] Test: Clicking "Retry" in `QuickCaptureBar` disables the button and preserves the input field on repeated failure.

## Developer Guardrails

- **Architecture Compliance:**
  - Component Location: `apps/web/src/features/todos/components/`.
  - State Management: Use TanStack Query mutation `reset()` and `mutate()`/`mutateAsync()`.
- **UX Compliance:**
  - **UX-DR7:** "Implement RetryInlineAction on failed items so recovery occurs in context and per-item."
  - **UX-DR8:** "Preserve failed user input and keep failed items visible; never fake persistence success."
- **Testing Standards:**
  - Use `renderWithClient` and `msw` (if available) or manual mocks for failing API responses.
  - Ensure `aria-disabled` is used on the retry button when in-flight for accessibility.

## Previous Story Intelligence (Story 3.2)

- **Learnings:**
  - `PersistenceStatusBadge` is already integrated and maps `isPending`, `isSuccess`, `isError`.
  - `TodoItemRow` and `QuickCaptureBar` already use `usePersistenceStatus` hook.
  - A 3-second timeout is implemented for the "Saved" status in the badge lifecycle.
  - Vitest timers can be tricky in the monorepo; prefer real timers with `waitFor` for integration tests if timeouts are involved.

## Git Intelligence Summary

- Recent commits (fb70827) established the `PersistenceStatusBadge` and its integration.
- The `TodoItemRow` already has skeleton retry functions that need hardening.

## Project Context Reference

- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/hooks/use-persistence-status.ts`

Status: review

## Story Agent Record

### Implementation Plan
- Updated `usePersistenceStatus` hook to return "saving" status when `isPending` is true.
- Enhanced `TodoItemRow` and `QuickCaptureBar` to disable "Retry" buttons during in-flight mutations.
- Implemented "sticky" error state in both components using `useState` and `useEffect` to keep the error message and retry button visible during retry attempts (satisfying AC3).
- Added `aria-disabled` and `aria-live` considerations for better accessibility.
- Created comprehensive integration tests in `apps/web/src/features/todos/components/inline-retry.test.tsx`.

### Debug Log
- Identified that TanStack Query resets error state on `mutate()`, causing retry UI to flicker/disappear. Fixed by caching the last error in component state.
- Noted pre-existing timeout issues in `persistence-lifecycle.test.tsx` related to fake timers in the monorepo environment; used `waitFor` and real timers for new integration tests as recommended.

### Completion Notes
- All Acceptance Criteria (AC1-AC4) have been met.
- Unit and integration tests for new functionality pass.
- Verified that input is preserved in `QuickCaptureBar` on failure.

## File List
- `apps/web/src/features/todos/hooks/use-persistence-status.ts`
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/inline-retry.test.tsx`

### Review Findings

- [x] [Review][Patch] Duplicated error state management [QuickCaptureBar.tsx, TodoItemRow.tsx]
- [x] [Review][Patch] Misleading `isPending` state for multiple mutations [TodoItemRow.tsx:36]
- [x] [Review][Patch] Redundant `aria-disabled` on native buttons [QuickCaptureBar.tsx:112, TodoItemRow.tsx:122]
- [x] [Review][Patch] Stale error message during re-typing [QuickCaptureBar.tsx:37]
- [x] [Review][Patch] Hardcoded error message strings [Multiple]
- [x] [Review][Patch] Missing `mutation.reset()` on new attempts [QuickCaptureBar.tsx:37, TodoItemRow.tsx:81]
- [ ] [Review][Patch] Brittle `fetch` and URL mocking in tests [inline-retry.test.tsx]
- [x] [Review][Patch] Missing programmatic link between errors and controls [QuickCaptureBar.tsx:105, TodoItemRow.tsx:114]
- [x] [Review][Patch] Inconsistent use of `.then().catch()` for async flow [QuickCaptureBar.tsx:52]

## Change Log
- 2026-04-03: Initial implementation of inline retry logic and tests.

## Status

Status: review
