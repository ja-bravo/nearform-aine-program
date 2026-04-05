---
title: 'Fix CI missing build artifacts'
type: 'bugfix'
created: '2026-04-05'
status: 'done'
baseline_commit: '83afdcc1f9013a90cc5f52e7f213ff3cc84cd5a2'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The CI `quality-gate` job fails because it attempts to start the API and Web services using `pnpm start` without first ensuring that the build artifacts (`dist/` and `.next/`) are present in the runner's filesystem.

**Approach:** Add a `pnpm turbo run build` step to the `quality-gate` job in `.github/workflows/test.yml` before starting the services. This will leverage Turbo's cache (populated by the `build` job) to restore the artifacts to the filesystem.

## Boundaries & Constraints

**Always:** Use `pnpm turbo run build` to restore artifacts, ensuring consistency with the project's build system and caching.

**Ask First:** If the `quality-gate` job should be refactored to use Playwright's `webServer` instead of manually starting services (currently out of scope to avoid regressions).

**Never:** Modify the `build` job or the `test-e2e` job unless they are also found to be missing artifacts (currently they appear to be using Turbo correctly).

</frozen-after-approval>

## Code Map

- `.github/workflows/test.yml` -- CI pipeline definition where the `quality-gate` job resides.
- `apps/api/package.json` -- Defines the `start` script for the API.
- `apps/web/package.json` -- Defines the `start` script for the Web app.
- `turbo.json` -- Defines task dependencies and outputs for the monorepo.

## Tasks & Acceptance

**Execution:**
- [x] `.github/workflows/test.yml` -- Add `pnpm turbo run build` step to `quality-gate` job -- Ensures build artifacts are restored from cache before starting services.

**Acceptance Criteria:**
- Given the `quality-gate` job in CI, when it executes, then it should successfully start both API and Web services and proceed to quality checks without "module not found" errors.

## Verification

**Commands:**
- `pnpm turbo run build` -- expected: Success (local check)
- `git diff .github/workflows/test.yml` -- expected: New build step in `quality-gate` job.

**Manual checks (if no CLI):**
- Inspect the updated `test.yml` to ensure the new step is placed after `pnpm install` and before `Start API`.

## Suggested Review Order

- Restores build artifacts from Turbo cache before services start, fixing "module not found" errors in the CI quality-gate.
  [`test.yml:317`](../../.github/workflows/test.yml#L317)
