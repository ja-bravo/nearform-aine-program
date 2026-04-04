# Story 4.4: Validate Accessibility and Responsive Quality Gates

Status: done

<!-- Note: This story is created by the BMad Method story-creation workflow. -->

## Dev Agent Record

### Implementation Plan
- Initialize Playwright in `apps/web` with standard configuration.
- Install `@axe-core/playwright` for automated accessibility scanning.
- Implement a11y tests for Home page (online/offline states).
- Implement responsive viewport tests for Mobile, Tablet, and Desktop breakpoints.
- Add `test:e2e` and `quality-gate` scripts to `package.json`.
- Add `data-testid` to key components to improve E2E test reliability.

### Debug Log
- Encountered port 3000 conflict with Docker `web` service. Resolved by stopping the docker container for local testing.
- Fixed E2E offline test by changing the sequence (goto first, then setOffline) and adding a manual `offline` event trigger.
- Fixed regression in `OfflineReadOnlyBanner.spec.tsx` where test was out of sync with actual implementation.
- **Review Updates:**
  - Parameterized `baseURL` in Playwright config.
  - Added interaction flow to responsive E2E tests.
  - Aligned viewports with Tailwind breakpoints (640, 768, 1024).
  - Added animation handling and explicit state cleanup in a11y tests.
  - Added `data-testid` to inputs and buttons for better robustness.
  - Updated `quality-gate` script to run on all configured browsers.

### Completion Notes
- Playwright E2E framework is fully functional.
- Accessibility scans cover both regular state and the offline banner.
- Responsive tests verify layout integrity across all target breakpoints.
- All tests pass: 5 E2E tests and updated unit tests.

## File List
- `apps/web/package.json`
- `apps/web/playwright.config.ts`
- `apps/web/e2e/a11y/todo-list.axe.spec.ts`
- `apps/web/e2e/responsive/todo-layout.spec.ts`
- `apps/web/e2e/a11y/README.md`
- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/shared/ui/offline-read-only-banner.tsx`
- `apps/web/src/shared/ui/offline-read-only-banner.spec.tsx`

## Change Log
- **2026-04-04:** Initial implementation of Story 4.4.
  - Setup Playwright and Axe-Core.
  - Added automated a11y scans for WCAG 2.2 AA.
  - Added responsive viewport quality gates.
  - Added `data-testid` for robust testing.
  - Fixed regression in `OfflineReadOnlyBanner` tests.
  - **Refinement from Code Review:** Improved E2E reliability, interactive coverage, and alignment with Tailwind breakpoints.

## Story

As a **product team**,
I want **automated and manual checks for UX quality constraints**,
so that **regressions are caught before release**.

## Acceptance Criteria

1. **[AC1] Playwright E2E Framework Setup**
   - Playwright is initialized in `apps/web` with a standard configuration.
   - The `webServer` is configured in `playwright.config.ts` to start the web app (`pnpm dev`) and wait for it to be ready.
   - Scripts are added to `apps/web/package.json` for running E2E tests (`test:e2e`).

2. **[AC2] Automated Accessibility Quality Gate**
   - `@axe-core/playwright` is installed and integrated into the test suite.
   - An accessibility scan is performed on the primary todo surface (Home page).
   - The test fails if any WCAG 2.2 Level AA violations are detected.
   - Specific checks include: contrast, labels, roles, and keyboard operability.

3. **[AC3] Responsive Viewport Quality Gate**
   - E2E tests verify the core todo flow (add, list, complete, delete) across three primary breakpoints:
     - **Mobile:** 320px (base)
     - **Tablet:** 768px
     - **Desktop:** 1024px
   - Tests confirm no horizontal scrolling and that interactive elements (add button, delete button) remain visible and clickable at all sizes.

4. **[AC4] Documentation and Regression Guards**
   - A `quality-gate` script is added to `apps/web/package.json` that runs both accessibility and responsive checks.
   - Any intentional accessibility gaps (if any) are documented in `apps/web/e2e/a11y/README.md` or as skipped test cases with rationale.

## Tasks / Subtasks

- [x] **T1 — Playwright & Axe-Core Initialization** (AC1, AC2)
  - [x] Initialize Playwright in `apps/web` (recommend `pnpm create playwright` or manual setup to match project structure).
  - [x] Install `@axe-core/playwright` as a dev dependency.
  - [x] Configure `apps/web/playwright.config.ts`:
    - [x] Set `baseURL` to `http://localhost:3000`.
    - [x] Configure `webServer` to run `pnpm dev`.
    - [x] Define projects for `chromium`, `firefox`, `webkit`, and `Mobile Safari`.

- [x] **T2 — Implement Automated Accessibility Scans** (AC2)
  - [x] Create `apps/web/e2e/a11y/todo-list.axe.spec.ts`.
  - [x] Implement a test that uses `AxeBuilder` to scan the home page.
  - [x] Ensure the scan includes checks for WCAG 2.2 Level AA.
  - [x] Verify that custom components like `PersistenceStatusBadge` and `OfflineReadOnlyBanner` (if rendered) pass accessibility checks.

- [x] **T3 — Implement Responsive Viewport Tests** (AC3)
  - [x] Create `apps/web/e2e/responsive/todo-layout.spec.ts`.
  - [x] Write tests that iterate through the three standard breakpoints (320px, 768px, 1024px).
  - [x] For each breakpoint, verify that the `QuickCaptureBar` and `TodoItemRow` controls are accessible and not overlapping.

- [x] **T4 — Define Quality Gate Scripts** (AC4)
  - [x] Add `"test:e2e": "playwright test"` to `apps/web/package.json`.
  - [x] Add `"quality-gate": "pnpm test:e2e --project=chromium --grep @a11y|@responsive"`.
  - [x] Verify all tests pass locally.

### Review Findings

- [x] [Review][Decision] Inconsistent Breakpoint Validation — The responsive tests use viewports (320, 768, 1024) that do not align with the Tailwind breakpoints used in the components (e.g., sm:640px). Resolution: Align viewports with Tailwind boundaries (640, 768, 1024).
- [x] [Review][Patch] Brittle Manual Offline Event & Race [apps/web/e2e/a11y/todo-list.axe.spec.ts]
- [x] [Review][Patch] Hardcoded Port 3000 / Conflict [apps/web/playwright.config.ts]
- [x] [Review][Patch] Missing Interactive Flow in Responsive/A11y Tests [apps/web/e2e/responsive/todo-layout.spec.ts]
- [x] [Review][Patch] Quality Gate Script Bypass [apps/web/package.json]
- [x] [Review][Patch] Brittle Hex Code Assertions [apps/web/src/shared/ui/offline-read-only-banner.spec.tsx]
- [x] [Review][Patch] Missing Data-Testids on Actionable Elements [apps/web/src/features/todos/components/quick-capture-bar.tsx]
- [x] [Review][Patch] Race Condition in Scroll/Layout Validation [apps/web/e2e/responsive/todo-layout.spec.ts]
- [x] [Review][Patch] Insecure WebServer Reuse Policy [apps/web/playwright.config.ts]
- [x] [Review][Patch] Poor Error Diagnostics in a11y [apps/web/e2e/a11y/todo-list.axe.spec.ts]
- [x] [Review][Patch] Missing Cleanup for Offline State [apps/web/e2e/a11y/todo-list.axe.spec.ts]
- [x] [Review][Patch] Arbitrary Viewport Heights [apps/web/e2e/responsive/todo-layout.spec.ts]
- [x] [Review][Patch] Accessibility Scan Mid-Animation [apps/web/e2e/a11y/todo-list.axe.spec.ts]
- [x] [Review][Patch] Incomplete Responsive Component Coverage [apps/web/e2e/responsive/todo-layout.spec.ts]
- [x] [Review][Patch] Missing Accessibility Documentation [apps/web/e2e/a11y/README.md]
- [x] [Review][Patch] Unverified Custom Component (PersistenceStatusBadge) [apps/web/e2e/a11y/todo-list.axe.spec.ts]

## Developer Guardrails

- **Architecture Compliance:**
  - **Location:** E2E tests MUST be placed in `apps/web/e2e/`.
  - **Scripts:** Always use `pnpm` workspace commands (e.g., `pnpm --filter web ...`).
  - **Tooling:** Use `@axe-core/playwright` for accessibility; do not reinvent scan logic.
- **UX Compliance:**
  - **UX-DR13:** "Ensure responsive behavior across mobile/tablet/desktop breakpoints...".
  - **UX-DR14:** "Ensure accessibility coverage...".
  - **NFR-A1/A2:** Aligns with WCAG 2.2 AA and keyboard focus targets.
- **Testing Standards:**
  - Automated scans MUST fail the build on violations (zero-tolerance policy for AA).
  - Use Page Object Model (POM) if the E2E suite grows beyond 3-4 files.
  - Ensure `webServer` timeout is sufficient for Next.js cold starts.

## Previous Story Intelligence (Epic 4.2 & 4.3)

- **Learnings from 4.2:** Keyboard navigation is guarded by Vitest in `keyboard-navigation.test.tsx`. Playwright tests should complement this by verifying the *actual* rendered accessibility tree.
- **Status of 4.3:** 4.3 ensures semantic roles and non-color cues are present. 4.4 acts as the automated "police" to ensure those roles don't regress.

## Git Intelligence Summary

- Recent work focused on improving the `TodoItemRow` and `QuickCaptureBar` with focus rings and ARIA labels.
- The project is a monorepo; ensure Playwright ignores the `apps/api` and `packages` folders unless specifically needed.

## Project Context Reference

- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/todo-item-row.tsx`
- `apps/web/src/features/todos/components/todo-list.tsx`
- `apps/web/playwright.config.ts` (to be created)

## Web Intelligence (2026)

- **Playwright Best Practices:** Use `test.step()` for better reporting in long E2E journeys.
- **Axe-Core:** `AxeBuilder.withTags(['wcag2aa', 'wcag22aa'])` is the standard for 2026 compliance.
- **Mobile Emulation:** Playwright's `devices['iPhone 13']` or similar is preferred over manual viewport settings for "true" mobile testing.
