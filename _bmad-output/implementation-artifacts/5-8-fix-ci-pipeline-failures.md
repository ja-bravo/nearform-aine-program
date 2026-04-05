---
title: '5-8-fix-ci-pipeline-failures'
type: 'bugfix'
created: '2026-04-05'
status: 'done'
baseline_commit: 'ffc148aa26feb9fa6ec35cd7fb0bc561f45aede9'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The CI pipeline is failing due to a React lint error in `PersistenceStatusBadge`, a timing-related unit test failure in `PersistenceLifecycle`, and flaky E2E tests that often miss the transient 'Saving' state.

**Approach:** Fix the lint error by updating state during render (derived state pattern) instead of in a synchronous `useEffect`. Adjust unit test timers to account for the component's 300ms fade-out animation. Add a 100ms delay to E2E API mocks to reliably capture the 'Saving' state. Ensure CI jobs perform a `turbo build` to restore artifacts from cache.

## Boundaries & Constraints

**Always:** Follow the project's React and TypeScript coding standards.

**Ask First:** If any other CI jobs besides `test`, `e2e`, and `lint` are found to be failing.

**Never:** Disable lint rules or skip tests as a "fix".

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Status change in Badge | Badge updates smoothly with fade-out | N/A |
| TEST_TIMING | 3000ms + 300ms fade-out | "Saved" badge is removed after ~3300ms | N/A |
| E2E_VISIBILITY | 100ms API delay | "Saving" state is caught by Playwright | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/src/features/todos/components/persistence-status-badge.tsx` -- Main badge component with lint issue.
- `apps/web/src/features/todos/components/persistence-lifecycle.test.tsx` -- Unit test with timing failure.
- `apps/web/e2e/todo-happy-path.spec.ts` -- E2E test with flakiness.
- `.github/workflows/test.yml` -- CI workflow configuration.
- `apps/web/eslint.config.mjs` -- ESLint configuration to ignore coverage.
- `turbo.json` -- Monorepo task pipeline configuration.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/features/todos/components/persistence-status-badge.tsx` -- Use derived state pattern to fix sync-update lint error.
- [x] `apps/web/src/features/todos/components/persistence-lifecycle.test.tsx` -- Update timer advance from 3000ms to 3500ms to cover fade-out.
- [x] `apps/web/e2e/todo-happy-path.spec.ts` -- Add 100ms delay to API route mocks.
- [x] `.github/workflows/test.yml` -- Add `pnpm turbo run build` step to `test-e2e` and `burn-in` jobs.
- [x] `apps/web/eslint.config.mjs` -- Add `coverage/**` to global ignores.
- [x] `turbo.json` -- Add `quality-gate` task to enable running it via Turbo.

**Acceptance Criteria:**
- Given a clean environment, when `pnpm turbo run lint` is executed, then no errors are reported.
- Given the web app, when `pnpm turbo run test --filter web` is executed, then all unit tests pass.
- Given a running postgres DB and `DATABASE_URL` set, when `pnpm --filter web test:e2e --project=chromium` is executed, then all E2E tests pass including 'Saving' state checks.
- Given the monorepo, when `pnpm turbo run quality-gate` is executed, then the task is found and executed correctly.

## Verification

**Commands:**
- `pnpm turbo run lint` -- expected: SUCCESS
- `pnpm turbo run test --filter web` -- expected: SUCCESS
- `pnpm --filter web test:e2e --project=chromium` -- expected: SUCCESS

## Suggested Review Order

**React State**

- Use derived state pattern to sync status without extra effect cycle.
  [`persistence-status-badge.tsx:92`](../../apps/web/src/features/todos/components/persistence-status-badge.tsx#L92)

- Guard fade-out timer to only run when transitioning from truthy to null.
  [`persistence-status-badge.tsx:103`](../../apps/web/src/features/todos/components/persistence-status-badge.tsx#L103)

**E2E Stability**

- Introduce small API delay to ensure transient 'Saving' state is captured.
  [`todo-happy-path.spec.ts:13`](../../apps/web/e2e/todo-happy-path.spec.ts#L13)

**Unit Test Timing**

- Advance timers by 3500ms to cover the 300ms fade-out animation delay.
  [`persistence-lifecycle.test.tsx:85`](../../apps/web/src/features/todos/components/persistence-lifecycle.test.tsx#L85)

**CI Infrastructure**

- Ensure build artifacts are present for sharded E2E and burn-in jobs.
  [`test.yml:177`](../../.github/workflows/test.yml#L177)

- Optimize sharded builds to only target web and api packages.
  [`test.yml:244`](../../.github/workflows/test.yml#L244)

**Lint Configuration**

- Ignore coverage directory to prevent linting auto-generated files.
  [`eslint.config.mjs:12`](../../apps/web/eslint.config.mjs#L12)

**Turbo Configuration**

- Add quality-gate task to enable running it via Turbo.
  [`turbo.json:29`](../../turbo.json#L29)
