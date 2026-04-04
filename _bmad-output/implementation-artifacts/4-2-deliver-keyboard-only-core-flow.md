# Story 4.2: Deliver Keyboard-Only Core Flow

Status: done

<!-- Note: This story is created by the BMad Method story-creation workflow. -->

## Story

As a **keyboard user**,
I want **to execute all core todo actions without a mouse**,
so that **I can use the app efficiently and accessibly**.

## Acceptance Criteria

1. **[AC1] Logical Focus Order** [x]
   - The tab order follows the visual structure: `QuickCaptureBar` input -> "Add task" button -> `TodoList` items (checkbox -> retry action -> delete button).
   - Hidden or disabled elements are correctly omitted from the tab sequence.
   - The focus order remains predictable even when items are added, deleted, or updated.

2. **[AC2] Visible Focus Indicators** [x]
   - All interactive elements (inputs, buttons, checkboxes, links) have a high-contrast, clearly visible focus indicator when navigated via keyboard.
   - Indicators must be perceivable under both light and dark modes.
   - Focus indicators do not overlap with other UI elements or get clipped by container boundaries.

3. **[AC3] Full Workflow Completion via Keyboard** [x]
   - **Add:** Type in capture input and press `Enter` (or tab to "Add task" and press `Enter`/`Space`).
   - **Complete:** Navigate to a todo checkbox and toggle using `Space`.
   - **Delete:** Navigate to the "Delete" button and trigger with `Enter` or `Space`.
   - **Retry:** Navigate to the "Retry" button (when visible) and trigger with `Enter` or `Space`.

4. **[AC4] No Focus Traps** [x]
   - Users can move focus into and out of all interactive regions without getting stuck.
   - Functional areas (like error messages with retries) do not capture focus indefinitely.

5. **[AC5] Focus Management After Actions** [x]
   - After deleting an item, focus is moved to a logical nearby element (e.g., the next item in the list or the capture input if the list is empty) rather than being lost to the document body.
   - After adding an item, focus returns to the capture input to support rapid-fire entry.

## Tasks / Subtasks

- [x] **T1 — Visible Focus Indicator Audit and Enhancement** (AC2)
  - [x] Review `apps/web/src/features/todos/components/todo-item-row.tsx`: Add explicit `focus-visible` styling to the "Delete" button and "Retry" actions.
  - [x] Review `apps/web/src/features/todos/components/quick-capture-bar.tsx`: Ensure the "Retry" button has consistent `focus-visible` styling.
  - [x] Ensure all focus rings use semantic tokens (e.g., `ring-zinc-500` or `outline-zinc-900`) and have proper offsets (`focus-visible:ring-offset-2`).

- [x] **T2 — Focus Management Implementation** (AC5)
  - [x] In `apps/web/src/features/todos/components/todo-item-row.tsx`: Implement logic to handle focus after a successful delete. If the current item is removed, move focus to the next item's checkbox, or the previous item's checkbox if it was the last one.
  - [x] In `apps/web/src/features/todos/components/quick-capture-bar.tsx`: Ensure focus remains in the input field after a successful "Add task" submission to allow continuous entry.

- [x] **T3 — Keyboard Interaction Refinement** (AC3)
  - [x] Verify `QuickCaptureBar` supports `Enter` for submission (standard form behavior).
  - [x] Verify `TodoItemRow` checkbox toggles correctly with `Space`.
  - [x] Ensure any custom buttons (like Retry) respond to both `Enter` and `Space`.

- [x] **T4 — Logical Tab Order Verification** (AC1)
  - [x] Audit the `TodoList` to ensure the tab sequence doesn't skip interactive metadata or status badges that might contain actionable links/buttons.
  - [x] Ensure the `OfflineReadOnlyBanner` (if present) is properly integrated into the tab order if it contains interactive elements.

## Developer Guardrails

- **Architecture Compliance:**
  - Styling: Use Tailwind's `focus-visible` utility exclusively for keyboard indicators to avoid showing focus rings on click/touch.
  - Naming: Maintain existing component structure (`QuickCaptureBar`, `TodoItemRow`).
- **UX Compliance:**
  - **UX-DR14:** "Ensure accessibility coverage for keyboard operability, visible focus...".
  - **NFR-A2:** "Focus order and visible focus indicators support keyboard-only completion of core flows without traps."
- **Testing Standards:**
  - Perform a "No Mouse" test pass: disconnect the mouse and attempt to use the entire application.
  - Use `axe-core` or Playwright's `accessibility` testing to verify no focus traps or tab order violations.

## Previous Story Intelligence (Epic 4.1)

- **Learnings:**
  - Touch targets were increased to ~40-44px. These large targets are also beneficial for keyboard users as they provide a larger visual area for the focus ring.
  - The layout shell now uses `max-w-2xl`, which keeps the interface centered and easier to scan during keyboard navigation.

## Git Intelligence Summary

- Recent work on `apps/web/src/features/todos/components/todo-item-row.tsx` added `aria-label` and `aria-describedby` for a11y.
- The project follows a strict functional component pattern with `useForm` for the capture bar.

## Project Context Reference

- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/todo-list.tsx`
- `apps/web/src/shared/ui/offline-read-only-banner.tsx`

## Web Intelligence

- **WCAG 2.2 Focus Visibility:** Requires a focus indicator to have a minimum area and contrast. Using `focus-visible:ring-2` with `ring-offset-2` is a standard best practice for meeting this.
- **Focus After Deletion:** A common pattern is to move focus to the container or the next logical item. If the list becomes empty, moving focus back to the "Add" input is helpful.

## Dev Agent Record (Implementation ONLY)

### Implementation Plan
1. **Focus Indicator Enhancement**: Review and update `QuickCaptureBar` and `TodoItemRow` to ensure all interactive elements have visible `focus-visible` rings with proper offsets and contrast.
2. **Explicit Focus Management**: 
   - Update `QuickCaptureBar` to explicitly return focus to the input field after successful task addition.
   - Update `TodoItemRow` to move focus to the next logical element (next item checkbox, previous item checkbox, or capture input) after successful deletion.
3. **Keyboard Interaction Audit**: Ensure all custom buttons (Retry) respond to keyboard triggers (`Enter`/`Space`) and verify standard form/checkbox behavior.
4. **Validation**: Create regression tests in `keyboard-navigation.test.tsx` to verify focus visibility and management logic.

### Change Log
- **2026-04-03**: Initial implementation of keyboard navigation enhancements.
- **2026-04-03**: Added `focus-visible` styling to all interactive elements in `QuickCaptureBar` and `TodoItemRow`.
- **2026-04-03**: Implemented focus management logic for todo deletion and addition.
- **2026-04-03**: Created `keyboard-navigation.test.tsx` and verified all requirements.

### File List
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/keyboard-navigation.test.tsx`

### Completion Notes
All acceptance criteria for keyboard-only core flow have been met.
- **AC1 & AC4**: Tab order and focus traps were audited; the layout remains predictable and accessible.
- **AC2**: High-contrast `focus-visible` rings added to all buttons and inputs.
- **AC3**: Verified that Add, Complete, Delete, and Retry actions are all triggerable via keyboard.
- **AC5**: Focus management logic ensures the user never loses their place after destructive or constructive actions.
- Tests: 8 new tests added specifically for keyboard navigation, plus full regression suite passing.

### Review Findings

- [x] [Review][Patch] Brittle DOM traversal for focus management [todo-item-row.tsx:80]
- [x] [Review][Patch] Hardcoded DOM ID dependency [todo-item-row.tsx:83]
- [x] [Review][Patch] Redundant logic duplication in QuickCaptureBar [quick-capture-bar.tsx:50]
- [x] [Review][Patch] Inconsistent focus palette/contrast [quick-capture-bar.tsx:92]
- [x] [Review][Patch] Lazy type casting for focus target [todo-item-row.tsx:83]
- [x] [Review][Patch] Sprint status timestamp drift [sprint-status.yaml:2]
- [x] [Review][Patch] Focus stealing during submission [quick-capture-bar.tsx:50]
- [x] [Review][Patch] Focusing disabled input in read-only [quick-capture-bar.tsx:50]
- [x] [Review][Defer] Inefficient per-row refs for focus management [todo-item-row.tsx:40] — deferred, pre-existing concern for large lists
