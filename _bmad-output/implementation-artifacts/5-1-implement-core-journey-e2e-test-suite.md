# Story 5.1: Implement Core Journey E2E Test Suite

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,  
I want **automated Playwright tests covering the full todo lifecycle (create, list, complete, delete, recovery)**,  
so that **I can prevent functional regressions across all supported viewports**.

## Acceptance Criteria

1. **[AC1] Core Scenario Coverage**  
   - At least 5 distinct test scenarios must pass, covering:
     - 1.1: Quick capture and list visibility. [x]
     - 1.2: Toggle completion and visual state change. [x]
     - 1.3: Item deletion and list reconciliation. [x]
     - 1.4: Inline retry after simulated API failure (using Playwright `route` mocking). [x]
     - 1.5: Layout responsiveness (mobile vs desktop viewports). [x]
2. **[AC2] Local Environment Readiness**  
   - Tests must run successfully against a local environment (Web, API, DB). [x]
3. **[AC3] CI Pipeline Integration**  
   - Tests must be integrated into the CI quality gate and pass automatically on pull requests. [x]

## Tasks / Subtasks

- [x] **T1 — Initialize Playwright in `apps/web`** (AC2)
  - [x] Ensure `playwright` is installed in `apps/web`.
  - [x] Configure `apps/web/playwright.config.ts` with `baseURL`, `webServer`, and `projects` for `Desktop Chrome` and `Mobile Safari`.
- [x] **T2 — Implement Happy Path Test Suite** (AC1.1, AC1.2, AC1.3)
  - [x] Create `apps/web/e2e/todo-happy-path.spec.ts`.
  - [x] Implement test: "User can create, complete, and delete a todo".
  - [x] Verify visual state changes (checkmarks, strikethroughs) using CSS selector assertions.
- [x] **T3 — Implement Recovery and Failure Test** (AC1.4)
  - [x] Create `apps/web/e2e/todo-recovery.spec.ts`.
  - [x] Use `page.route()` to intercept `/api/v1/todos` and return `500 Internal Server Error`.
  - [x] Verify `Not saved` badge and `Retry` button visibility.
  - [x] Re-enable API and verify `Retry` succeeds.
- [x] **T4 — Implement Responsive Layout Test** (AC1.5)
  - [x] Create `apps/web/e2e/responsive/todo-layout.spec.ts`.
  - [x] Verify that the `QuickCaptureBar` and `TodoItemRow` components are visible and functional at 375px (mobile) and 1280px (desktop) widths.
- [x] **T5 — Configure CI Quality Gate** (AC3)
  - [x] Add `test:e2e` script to `apps/web/package.json`.
  - [x] Update `turbo.json` to include `test:e2e` in the pipeline with appropriate dependencies.

## Dev Notes

- **Architecture Compliance:**
  - Place all tests in `apps/web/e2e/` as per the project structure in `architecture.md`.
  - Use Playwright locators (`getByRole`, `getByText`, `getByPlaceholder`) to target elements by user-visible attributes.
  - Do not use implementation-specific test IDs unless absolutely necessary.
- **Testing Standards:**
  - Tests should be isolated; use `beforeEach` to clear or seed the database if necessary, or ensure unique todo titles per test run.
  - Match the persistence states (`Saving`, `Saved`, `Not saved`) as defined in `ux-design-specification.md`.
- **Source Tree Components:**
  - `apps/web/e2e/` (New directory)
  - `apps/web/package.json`
  - `turbo.json`

### Project Structure Notes

- Alignment with unified project structure: E2E tests are co-located with the web application under a dedicated `e2e` folder.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Testing Strategy]
- [Source: _bmad-output/planning-artifacts/prd.md#Measurable Outcomes]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 1, 2, 3]

## Dev Agent Record

### Agent Model Used

Gemini 1.5 Pro (via BMad story-creation workflow)

### Debug Log References

- Fixed `PersistenceStatusBadge` to accept `data-testid` for reliable visibility assertions in E2E tests.
- Updated `e2e/a11y/todo-list.axe.spec.ts` to use `toBeAttached()` instead of `toBeVisible()` for the persistence badge, as it is naturally hidden when no mutation is active.
- Resolved `EADDRINUSE` by identifying that the API was already running in Docker.
- Installed missing Playwright browser binaries (`firefox`, `webkit`).
- Added `test:e2e` script to root `package.json` to allow running tests from the monorepo root via Turbo.

### Implementation Plan

1.  Verified existing Playwright configuration in `apps/web/playwright.config.ts`.
2.  Created `apps/web/e2e/todo-happy-path.spec.ts` for core CRUD flow.
3.  Created `apps/web/e2e/todo-recovery.spec.ts` for API failure simulation.
4.  Updated `apps/web/e2e/responsive/todo-layout.spec.ts` to include mobile (375px) and desktop (1280px) viewports.
5.  Added `test:e2e` task to `turbo.json`.
6.  Fixed accessibility test by allowing the persistence badge to be hidden but attached.
7.  Fixed `PersistenceStatusBadge` component to correctly apply `data-testid`.

### Completion Notes List

- ✅ All E2E test scenarios (CRUD, recovery, responsive, a11y) implemented and passing on Chromium.
- ✅ Playwright configuration confirmed and optimized for local development.
- ✅ Turbo pipeline updated to include E2E tests.
- ✅ Fixed minor component and test bugs that blocked reliable E2E execution.

### Review Findings

- [x] [Review][Decision] Arbitrary Burn-In Thresholds — The burn-in loop is hardcoded to 5 iterations. Is this sufficient, or should it be configurable/increased for better flakiness detection? (User chose 5)
- [x] [Review][Patch] Brittle Dependency Management [.github/workflows/test.yml:30,33,65,68,105,108,164,167]
- [x] [Review][Patch] Hardcoded Test Credentials [.github/workflows/test.yml:51,52,91,92,148,149,197]
- [x] [Review][Patch] Redundant Build Execution [.github/workflows/test.yml:122,179]
- [x] [Review][Patch] Test Race Conditions & Brittle Data [apps/web/e2e/todo-happy-path.spec.ts:10,23]
- [x] [Review][Patch] Brittle Selectors (CSS/TestID) [apps/web/e2e/todo-happy-path.spec.ts:27; apps/web/e2e/responsive/todo-layout.spec.ts]
- [x] [Review][Patch] Production Component Contamination [apps/web/src/features/todos/components/persistence-status-badge.tsx:840,857,863]
- [x] [Review][Patch] Low-Value A11y Fallback [apps/web/src/features/todos/components/todo-item-row.tsx:942,943]
- [x] [Review][Patch] Missing Turbo Cache for E2E [turbo.json:1156]
- [x] [Review][Patch] Hardcoded Environment URLs [.github/workflows/test.yml:127,198]
- [x] [Review][Patch] Inconsistent Webserver Commands [apps/web/playwright.config.ts:740,746]
- [x] [Review][Patch] Shell Quoting Vulnerability [scripts/burn-in.sh:43; .github/workflows/test.yml:207]
- [x] [Review][Patch] False Positive Recovery Assertions [apps/web/e2e/todo-recovery.spec.ts:45]
- [x] [Review][Patch] Component Transition Flicker [apps/web/src/features/todos/components/persistence-status-badge.tsx:866]
- [x] [Review][Patch] Missing Happy Path Persistence Checks [apps/web/e2e/todo-happy-path.spec.ts]

### File List

- `_bmad-output/implementation-artifacts/5-1-implement-core-journey-e2e-test-suite.md`
- `apps/web/e2e/todo-happy-path.spec.ts`
- `apps/web/e2e/todo-recovery.spec.ts`
- `apps/web/e2e/responsive/todo-layout.spec.ts`
- `apps/web/e2e/a11y/todo-list.axe.spec.ts`
- `apps/web/src/features/todos/components/persistence-status-badge.tsx`
- `turbo.json`
- `package.json`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
