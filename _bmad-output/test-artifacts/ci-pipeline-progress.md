---
stepsCompleted: ['step-01-preflight', 'step-02-generate-pipeline', 'step-03-configure-quality-gates', 'step-04-validate-and-summary']
lastStep: 'step-04-validate-and-summary'
lastSaved: '2026-04-04'
---

# CI Pipeline Setup Progress

## Step 1: Preflight Checks

- **Git Repository**: Verified.
- **Test Stack Type**: `fullstack` (monorepo with apps/web and apps/api).
- **Test Frameworks**:
  - Frontend (apps/web): Playwright (E2E), Vitest (Unit/Integration).
  - Backend (apps/api): Vitest (Unit/Integration).
- **Local Tests**: All tests passing locally (after fixing label mismatches and Vitest config).
- **CI Platform**: `github-actions` (default).
- **Environment Context**:
  - Runtime: Node.js (>=18, defaulting to 24 LTS).
  - Package Manager: pnpm@9.0.0.
  - Caching: node_modules, pnpm cache, Playwright browsers.

## Step 2: Generate CI Pipeline

- **Platform**: GitHub Actions.
- **Output Path**: `.github/workflows/test.yml`.
- **Stages**:
  - `lint`: Linting and Typechecking.
  - `test-unit`: Unit and Integration tests with Postgres service.
  - `test-e2e`: Sharded E2E tests (4 shards).
  - `burn-in`: Flaky detection loop for changed specs (5 iterations).
  - `report`: Final quality gate status summary.
- **Security**: Inputs routed through `env:` to prevent script injection.
- **Infrastructure**: Postgres 16-alpine service added for integration/E2E tests.
- **Framework Alignment**: `playwright.config.ts` updated to support separate commands for dev and production (CI) environments.

## Step 3: Quality Gates & Notifications

- **Burn-In Loop**: Configured for changed E2E specs (5 iterations) to detect UI flakiness.
- **Quality Gates**:
  - 100% pass rate required for Unit/Integration tests.
  - E2E tests must pass (sharded, with retries).
  - Burn-in loop must pass for all iterations.
- **Notifications**:
  - GitHub Actions Job Summary provides a "Quality Gate Status" table.
  - Failure warnings and flaky test alerts integrated into the summary.
  - Artifact collection (traces, screenshots, HTML reports) configured for 30 days.

## Step 4: Validate & Summarize

- **Validation**: All configuration items verified against the checklist.
- **Helper Scripts**:
  - `scripts/ci-local.sh`: Local CI simulation.
  - `scripts/burn-in.sh`: Standalone burn-in runner.
  - `scripts/test-changed.sh`: Targeted test runner for changed packages.
- **Documentation**:
  - `docs/ci.md`: Comprehensive pipeline guide.
  - `docs/ci-secrets-checklist.md`: Secrets configuration guide.
- **Completion Status**: CI/CD quality pipeline scaffolded and validated.
