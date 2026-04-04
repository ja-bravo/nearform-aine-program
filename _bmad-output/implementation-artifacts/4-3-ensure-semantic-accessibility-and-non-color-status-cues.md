# Story 4.3: Ensure Semantic Accessibility and Non-Color Status Cues

Status: ready-for-dev

<!-- Note: This story is created by the BMad Method story-creation workflow. -->

## Story

As a **screen-reader or low-vision user**,
I want **controls and statuses to be semantically clear**,
so that **I can understand and operate the interface reliably**.

## Acceptance Criteria

1. **[AC1] Semantic Structure & Roles**
   - The main content is wrapped in a `<main>` element.
   - The todo list uses a semantic `<ul>` with `<li>` children for each item.
   - Interactive elements use native HTML tags (`button`, `input`) or appropriate ARIA roles.
   - Each `TodoItemRow` is identified as a list item by assistive technologies.

2. **[AC2] Accessible Names & Labels**
   - All icon-only buttons (e.g., Delete, Retry) have explicit, descriptive `aria-label` attributes.
   - The quick capture input has a visible `<label>` or an `aria-label` if a visible label is visually redundant.
   - Checkboxes are correctly labeled with the todo's text (e.g., `aria-label="Complete task: [todo-text]"`).

3. **[AC3] Non-Color Status Cues**
   - Critical states (Saving, Saved, Not Saved, Offline) are communicated via text labels and/or distinct icons, never color alone.
   - The `PersistenceStatusBadge` displays visible text labels (`Saving`, `Saved`, `Not saved`) paired with high-contrast semantic icons.
   - The `OfflineReadOnlyBanner` uses a clear "Offline" text label and warning icon.

4. **[AC4] Dynamic Status Announcements**
   - Use `aria-live` or `role="status"` regions to announce critical state changes (e.g., "Task added", "Save failed", "Task deleted", "Connected/Offline").
   - Status updates are announced concisely without interrupting the user's current task unnecessarily.

5. **[AC5] WCAG 2.2 Level AA Contrast**
   - All text (including status labels and microcopy) meets the 4.5:1 contrast ratio.
   - Interactive UI components and graphical objects meet the 3:1 contrast ratio.
   - Focus indicators (already implemented in 4.2) maintain high contrast against their background.

## Tasks / Subtasks

- [ ] **T1 — Audit and Enhance Semantic Structure** (AC1)
  - [ ] Ensure `apps/web/app/page.tsx` uses a `<main>` element.
  - [ ] Update `apps/web/src/features/todos/components/todo-list.tsx` to use `<ul>`.
  - [ ] Update `apps/web/src/features/todos/components/todo-item-row.tsx` to use `<li>`.

- [ ] **T2 — Implement Accessible Names and Labels** (AC2)
  - [ ] Add `aria-label` to the Delete button in `TodoItemRow.tsx`.
  - [ ] Ensure the checkbox in `TodoItemRow.tsx` has a dynamic label: `aria-label={todo.isCompleted ? "Mark task active: " + todo.text : "Mark task complete: " + todo.text}`.
  - [ ] Add `aria-label` to the capture input in `QuickCaptureBar.tsx`.

- [ ] **T3 — Enhance Non-Color Status Indicators** (AC3)
  - [ ] Review `PersistenceStatusBadge.tsx`: Ensure text labels are always visible and paired with distinct icons (e.g., Spinner for Saving, Check for Saved, Alert for Not Saved).
  - [ ] Review `OfflineReadOnlyBanner.tsx`: Ensure it contains a clear "Offline" label and icon.

- [ ] **T4 — Implement ARIA Live Region Announcements** (AC4)
  - [ ] Add a persistent `aria-live="polite"` region (e.g., a hidden `div` or a dedicated component) to announce list changes.
  - [ ] Trigger announcements for: "Task added", "Task deleted", "Save failed", and connectivity changes.

- [ ] **T5 — Accessibility Quality Pass and Testing** (AC5)
  - [ ] Run `axe-core` on the main task surface and fix any violations.
  - [ ] Perform a manual screen reader pass (VoiceOver/NVDA) to verify announcements and labels.
  - [ ] Add Playwright a11y tests in `apps/web/e2e/a11y/todo-list.axe.spec.ts`.

## Developer Guardrails

- **Architecture Compliance:**
  - **Styling:** Use Tailwind's semantic utility classes (e.g., `text-zinc-900`, `bg-blue-600`).
  - **Naming:** Follow established kebab-case for new files and PascalCase for components.
- **UX Compliance:**
  - **UX-DR14:** "Ensure accessibility coverage... semantic labels, non-color-only status cues...".
  - **NFR-A1:** "Core user flows... conform to WCAG 2.2 Level AA".
- **Testing Standards:**
  - Every interactive element MUST have an accessible name.
  - No "color-only" status indicators allowed.
  - Verify all changes with `npm run test` and manual a11y checks.

## Previous Story Intelligence (Epic 4.2)

- **Learnings:**
  - Focus management was implemented using `focus-visible` and `ring-offset-2`.
  - Technical debt: Per-row refs for focus management (noted in `deferred-work.md`) should be monitored; don't add more complex ref logic if possible.
  - Focus order is already logical; maintain this while adding semantic roles.

## Git Intelligence Summary

- Recent commits follow the `feat(EPIC-STORY): Title` pattern.
- The project uses a monorepo structure with shared contracts.

## Project Context Reference

- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/todo-list.tsx`
- `apps/web/src/features/todos/components/persistence-status-badge.tsx`
- `apps/web/src/shared/ui/offline-read-only-banner.tsx`

## Web Intelligence

- **WCAG 2.2 Non-text Contrast (1.4.11):** Requires 3:1 contrast for UI components like focus indicators and status icons.
- **ARIA Live Regions:** `aria-live="polite"` is generally preferred for status updates to avoid interrupting the screen reader's current flow.
- **Accessible Name (1.3.1):** Labels must be programmatically associated with their controls.
