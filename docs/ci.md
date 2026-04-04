# CI/CD Pipeline Documentation

## Overview

This project uses **GitHub Actions** for CI/CD. The pipeline is designed to be fast, reliable, and provide clear feedback on code quality.

## Pipeline Configuration

The main pipeline is defined in `.github/workflows/test.yml`.

### Key Stages

1.  **Lint and Typecheck**: Runs `pnpm turbo run lint` and `pnpm turbo run typecheck` to ensure code style and type safety.
2.  **Unit & Integration Tests**: Runs `pnpm turbo run test` with a Postgres 16 service for API integration tests.
3.  **E2E (Sharded)**: Runs `pnpm turbo run test:e2e` across 4 parallel shards using Playwright.
4.  **Burn-In (Flaky Detection)**: Runs 5 iterations of changed E2E specs on PRs to catch UI flakiness early.
5.  **Final Summary**: Generates a quality gate status table in the GitHub Actions Job Summary.

## Quality Gates

-   **Unit Tests**: Must pass 100%.
-   **E2E Tests**: Must pass (2 retries allowed for transient failures).
-   **Burn-In Loop**: Must pass 100% stability for all iterations.

## Local Development

You can run the CI pipeline logic locally using the following scripts:

-   `./scripts/ci-local.sh`: Runs the entire CI suite locally (requires a running Postgres DB).
-   `./scripts/burn-in.sh`: Runs the burn-in loop for changed specs.
-   `./scripts/test-changed.sh`: Runs unit tests only for packages with changes.

## Secrets Management

The following secrets must be configured in GitHub (Settings > Secrets and variables > Actions):

-   *(None currently required for the base test suite)*.

## Troubleshooting

-   **E2E Failures**: Check the `e2e-artifacts-shard-N` artifacts for traces and screenshots.
-   **Burn-In Failures**: If the burn-in loop fails, it indicates flakiness in your new or modified tests. Review the logs and stabilize the tests.
-   **Database Issues**: Integration tests require a `DATABASE_URL`. Locally, ensure Docker is running with the provided `docker-compose.yml`.
