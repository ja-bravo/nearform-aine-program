# Story 4.4: Validate Accessibility and Responsive Quality Gates

Status: ready-for-dev

<!-- Note: This story is created by the BMad Method story-creation workflow. -->

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

- [ ] **T1 — Playwright & Axe-Core Initialization** (AC1, AC2)
  - [ ] Initialize Playwright in `apps/web` (recommend `pnpm create playwright` or manual setup to match project structure).
  - [ ] Install `@axe-core/playwright` as a dev dependency.
  - [ ] Configure `apps/web/playwright.config.ts`:
    - Set `baseURL` to `http://localhost:3000`.
    - Configure `webServer` to run `pnpm dev`.
    - Define projects for `chromium`, `firefox`, `webkit`, and `Mobile Safari`.

- [ ] **T2 — Implement Automated Accessibility Scans** (AC2)
  - [ ] Create `apps/web/e2e/a11y/todo-list.axe.spec.ts`.
  - [ ] Implement a test that uses `AxeBuilder` to scan the home page.
  - [ ] Ensure the scan includes checks for WCAG 2.2 Level AA.
  - [ ] Verify that custom components like `PersistenceStatusBadge` and `OfflineReadOnlyBanner` (if rendered) pass accessibility checks.

- [ ] **T3 — Implement Responsive Viewport Tests** (AC3)
  - [ ] Create `apps/web/e2e/responsive/todo-layout.spec.ts`.
  - [ ] Write tests that iterate through the three standard breakpoints (320px, 768px, 1024px).
  - [ ] For each breakpoint, verify that the `QuickCaptureBar` and `TodoItemRow` controls are accessible and not overlapping.

- [ ] **T4 — Define Quality Gate Scripts** (AC4)
  - [ ] Add `"test:e2e": "playwright test"` to `apps/web/package.json`.
  - [ ] Add `"quality-gate": "pnpm test:e2e --project=chromium --grep @a11y|@responsive"` (or equivalent filtering).
  - [ ] Verify all tests pass locally.

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
