---
title: 'check-e2e-workflow-variables'
type: 'maintenance'
created: '2026-04-05'
status: 'done'
baseline_commit: 'ea24cbda0adf8026ac6f0c6ec9d7d294df3bbfb9'
context:
  - '.github/workflows/test.yml'
  - 'turbo.json'
  - 'apps/web/src/shared/api/env.ts'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The CI pipeline and Turborepo configuration are missing critical environment variables, leading to potential "silent" build failures where the Web App is built without its API URL, and inconsistent Playwright configurations across different CI jobs.

**Approach:** Update `turbo.json` to whitelist `NEXT_PUBLIC_API_BASE_URL` for the `build` task and `BASE_URL` for the `test:e2e` task. Synchronize `.github/workflows/test.yml` to explicitly pass `BASE_URL` across all E2E-related jobs to ensure consistency and cache correctness.

## Boundaries & Constraints

**Always:** Follow the project's standard for environment variable naming and Turborepo task definitions.

**Ask First:** If any other `NEXT_PUBLIC_` variables are discovered that are not yet in the workflow.

**Never:** Use `--env-mode=loose` in Turbo as a shortcut; always whitelist specific variables.

</frozen-after-approval>

## Code Map

- `turbo.json` -- Define environment variable whitelists for `build`, `test:e2e`, and `quality-gate` tasks.
- `.github/workflows/test.yml` -- Centralize and propagate environment variables across all testing jobs.
- `apps/web/playwright.config.ts` -- Reference for how `BASE_URL` and `CI` are used in E2E tests.

## Tasks & Acceptance

**Execution:**
- [x] `turbo.json` -- Add `NEXT_PUBLIC_API_BASE_URL` to `build` task `env` array -- Ensure Next.js build captures the API URL for client-side fetches.
- [x] `turbo.json` -- Add `BASE_URL` to `test:e2e` task `env` array -- Allow Playwright to receive the correct target URL through Turbo.
- [x] `.github/workflows/test.yml` -- Add `BASE_URL: http://localhost:3000` to `test-e2e` and `burn-in` jobs -- Explicitly define the target URL for all sharded and flaky-detection runs.
- [x] `.github/workflows/test.yml` -- Ensure `NEXT_PUBLIC_API_BASE_URL` is passed to the `build` job -- Ensure the initial build step in CI has the necessary variable for the web app.

**Acceptance Criteria:**
- Given the `turbo.json` file, when `pnpm turbo run build` is executed in a clean environment with `NEXT_PUBLIC_API_BASE_URL` set, then the variable is available to the `next build` command.
- Given the GitHub Actions pipeline, when a PR is opened, then all E2E-related jobs (`test-e2e`, `burn-in`, `quality-gate`) use a consistent `BASE_URL`.
- Given the `test:e2e` task in Turbo, when executed with `BASE_URL` set in the environment, then Playwright receives this value.

## Verification

**Commands:**
- `pnpm turbo run build --dry-run` -- expected: `NEXT_PUBLIC_API_BASE_URL` listed in env dependencies for `build`.
- `pnpm turbo run test:e2e --dry-run` -- expected: `BASE_URL` listed in env dependencies for `test:e2e`.

## Spec Change Log

- 2026-04-05: Added `quality-gate` build step environment variables and fixed burn-in loop issues (missing `--force` and incorrect quoting of `$SPECS`). Verified that `NEXT_PUBLIC_API_BASE_URL` is the only relevant `NEXT_PUBLIC_` variable.

## Suggested Review Order

**Turbo Configuration**

- Whitelist `NEXT_PUBLIC_API_BASE_URL` to ensure Next.js captures the API URL during build.
  [`turbo.json:9`](../../turbo.json#L9)

- Whitelist `BASE_URL` to allow Playwright to receive the correct target URL through Turbo.
  [`turbo.json:29`](../../turbo.json#L29)

- Add `BASE_URL` to `quality-gate` task environment for consistency.
  [`turbo.json:34`](../../turbo.json#L34)

**CI Workflow Updates**

- Pass `NEXT_PUBLIC_API_BASE_URL` to the main build job to satisfy Next.js requirements.
  [`test.yml:75`](../../.github/workflows/test.yml#L75)

- Ensure the `test-e2e` build step has the API URL for the web app build.
  [`test.yml:181`](../../.github/workflows/test.yml#L181)

- Explicitly set `BASE_URL` for sharded E2E tests to avoid reliance on defaults.
  [`test.yml:187`](../../.github/workflows/test.yml#L187)

- Add missing `NEXT_PUBLIC_API_BASE_URL` to the `quality-gate` build step for consistency.
  [`test.yml:342`](../../.github/workflows/test.yml#L342)

**Flaky Detection (Burn-In)**

- Ensure the `burn-in` build step has the API URL for the web app build.
  [`test.yml:251`](../../.github/workflows/test.yml#L251)

- Explicitly set `BASE_URL` for the flaky-detection loop.
  [`test.yml:271`](../../.github/workflows/test.yml#L271)

- Add `--force` to ensure Turbo re-executes tests and fix `$SPECS` quoting for multiple files.
  [`test.yml:280`](../../.github/workflows/test.yml#L280)


