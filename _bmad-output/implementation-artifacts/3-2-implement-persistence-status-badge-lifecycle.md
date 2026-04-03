# Story 3.2: Implement Persistence Status Badge Lifecycle

Status: done

<!-- Note: This story is created by the BMad Method story-creation workflow. -->

## Story

As a **user**,
I want to **see whether each task is saving, saved, or not saved**,
so that **I can trust the data shown on screen**.

## Acceptance Criteria

1. **[AC1] Persistence Status Badge Component**
   - Create `apps/web/src/features/todos/components/persistence-status-badge.tsx`.
   - Supports states: `saving`, `saved`, `error` (displays "Not saved").
   - Uses semantic colors: Blue (`saving`), Green (`saved`), Red (`error`).
   - Pairs color with text labels for accessibility (NFR9, UX-DR14).
   - Component is responsive and adapts to the row layout.

2. **[AC2] Integration in TodoItemRow**
   - Each `TodoItemRow` displays the `PersistenceStatusBadge` during and after mutations (toggle completion, delete).
   - Shows `Saving` while the mutation is in-flight.
   - Shows `Not saved` if the mutation fails.
   - Shows `Saved` for a short duration (e.g., 2-3 seconds) after a successful mutation before fading out or becoming implicit.

3. **[AC3] Persistence Success Integrity**
   - The UI never implies persistence success before server confirmation (UX-DR8).
   - Status labels remain visible long enough to be perceivable and testable in automated and manual QA.

4. **[AC4] Inline Retry Integration**
   - The "Retry" action (from Story 3.1) must be visually associated with the `Not saved` status label.

## Tasks / Subtasks

- [x] **T1 — Create `PersistenceStatusBadge` component** (AC1)
  - [x] Implement `PersistenceStatusBadge` in `apps/web/src/features/todos/components/persistence-status-badge.tsx`.
  - [x] Define types for states: `'saving' | 'saved' | 'error'`.
  - [x] Apply Tailwind styles for semantic colors:
    - `saving`: Blue (e.g., `text-blue-600`, `bg-blue-50`)
    - `saved`: Green (e.g., `text-green-600`, `bg-green-50`)
    - `error`: Red (e.g., `text-red-600`, `bg-red-50`)
  - [x] Add unit tests in `persistence-status-badge.test.tsx`.

- [x] **T2 — Refactor `TodoItemRow` for Persistence States** (AC2, AC3, AC4)
  - [x] Integrate `PersistenceStatusBadge` into `TodoItemRow.tsx`.
  - [x] Map TanStack Query mutation states (`isPending`, `isSuccess`, `isError`) from `useCompleteTodoMutation` and `useDeleteTodoMutation` to the badge.
  - [x] Ensure the "Delete" button text change ("Deleting...") is coordinated with or replaced by the badge if redundant.
  - [x] Implement a "Saved" status timeout so the badge clears after a few seconds of success.

- [x] **T3 — Update `QuickCaptureBar` for Consistency** (AC1, AC2)
  - [x] Replace the literal "Saving…" text in the "Add task" button with the `PersistenceStatusBadge` or ensure the button styling reflects the same semantic colors and text.
  - [x] Ensure the badge appears in the capture bar area during creation.

- [x] **T4 — Integration Tests for Status Lifecycle** (AC2, AC3)
  - [x] Create `apps/web/src/features/todos/components/persistence-lifecycle.test.tsx`.
  - [x] Test: Toggling completion shows `Saving` -> `Saved` (briefly) -> hidden.
  - [x] Test: Deleting shows `Saving` -> (if success, item disappears; if error, shows `Not saved`).
  - [x] Test: Failed mutation shows `Not saved` and the Retry button.

## Developer Guardrails

- **Architecture Compliance:**
  - Component Location: `apps/web/src/features/todos/components/`. [Source: architecture.md — Structure Patterns]
  - State Management: Use TanStack Query mutation states. [Source: architecture.md — State Management Patterns]
- **UX Compliance:**
  - **UX-DR5:** "Implement a PersistenceStatusBadge that always pairs semantic color with text labels."
  - **UX-DR8:** "Never fake persistence success."
  - **Visual Direction:** Use Theme A (Calm Focus) colors: Blue `#2563EB`, Green `#16A34A`, Red `#DC2626`.
- **Testing Standards:**
  - Use `renderWithClient` to mock TanStack Query client.
  - Ensure `aria-live="polite"` is used on the badge for status announcements.

## Previous Story Intelligence (Story 3.1)

- **Learnings:**
  - `ErrorMessage` and `LoadingState` shared components are available in `apps/web/src/shared/ui/`.
  - `ApiError` is used for consistent error parsing.
  - Retry logic was implemented in `TodoItemRow` and `TodoHome`.
- **Patterns:**
  - `isPending` state is already used to disable inputs in `TodoItemRow`.

## Git Intelligence Summary

- Recent work established the `shared/ui` primitives and integrated error recovery into `TodoHome` and `TodoList`.
- Code conventions: functional components, explicit `FC` or props typing, Tailwind for styling.

## Project Context Reference

- `apps/web/src/features/todos/components/todo-item-row.tsx` is the primary target for integration.
- `apps/web/src/features/todos/hooks/` contains the necessary mutation hooks.

## Dev Agent Record

### Implementation Plan
- Create `PersistenceStatusBadge` component with states: `saving`, `saved`, `error`.
- Refactor `TodoItemRow` to use the badge, mapping TanStack Query mutation states.
- Refactor `QuickCaptureBar` to use the badge.
- Add unit and integration tests for the lifecycle and accessibility.

### Debug Log
- 2026-04-03: Implemented component and refactored features.
- 2026-04-03: Encountered Vitest fake timers timeout issues in integration tests. Switched to real timers with longer `waitFor` timeout as a robust solution for monorepo environment.
- 2026-04-03: All tests passed.

### Completion Notes
- ✅ Created `PersistenceStatusBadge` component.
- ✅ Integrated badge into `TodoItemRow` and `QuickCaptureBar`.
- ✅ Implemented 3-second "Saved" timeout for feedback.
- ✅ Verified with comprehensive unit and integration tests.
- ✅ Accessibility ensured with `aria-live="polite"` and semantic text labels.

## File List

- `apps/web/src/features/todos/components/persistence-status-badge.tsx`
- `apps/web/src/features/todos/components/persistence-status-badge.test.tsx`
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/persistence-lifecycle.test.tsx`

## Change Log

- 2026-04-02: Initial story creation for 3.2. Ready for development.
- 2026-04-03: Story implemented and tested. Status set to review.

## Status

Status: review

### Review Findings

- [x] [Review][Decision] UI Feedback Regression — Action buttons no longer change text to "Saving..." or "Deleting...", reducing immediate feedback. (User chose Option C: button-level feedback for primary action, badge for "Saved" confirmation only)
- [x] [Review][Decision] Retry Label Deviation — "Retry" buttons were renamed to "Retry update"/"Retry delete", deviating from the Story 3.1 pattern. (User chose Option B: Keep descriptive labels)
- [x] [Review][Patch] Logic Duplication [`quick-capture-bar.tsx`, `todo-item-row.tsx`]
- [x] [Review][Patch] Loss of Error Context [`quick-capture-bar.tsx`, `todo-item-row.tsx`]
- [x] [Review][Patch] Performance Inefficiency [`persistence-status-badge.tsx`]
- [x] [Review][Patch] Slow Tests [`persistence-lifecycle.test.tsx`]
- [x] [Review][Patch] Accessibility Downgrade [`quick-capture-bar.tsx`]
- [x] [Review][Patch] Retry Action Data Integrity [`quick-capture-bar.tsx:60`]
- [x] [Review][Patch] Timer Race Conditions [`quick-capture-bar.tsx`, `todo-item-row.tsx`]
- [x] [Review][Patch] Confusion on Delete [`todo-item-row.tsx`]
- [x] [Review][Patch] Missing Fade-out (AC2) [`persistence-status-badge.tsx`]
- [x] [Review][Patch] Typing Brittleness [`quick-capture-bar.tsx`]
