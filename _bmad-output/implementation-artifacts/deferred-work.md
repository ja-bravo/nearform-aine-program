# Deferred Work

## Deferred from: code review of 5-5-configure-performance-budgets-and-ci-quality-gates (2026-04-04)
- Redundant `pnpm install` in quality-gate job [.github/workflows/test.yml:255] (Optimization)

## Deferred from: fixing Docker standalone build for web (2026-04-05)
- Add `sharp` dependency for optimized image serving in production.
- Improve `.dockerignore` to reduce build context size.
- Optimize layer caching in `apps/web/Dockerfile`.
- Investigate and resolve ESM/CommonJS `__dirname` ambiguity in `next.config.ts`.
- Ensure unified pathing strategy in Dockerfiles.
- Audit `pnpm` version parity between local and Docker environments.
- Clarify application root structure in Docker container (WORKDIR vs package path).
- Monitor fragility of manual static/public copying in standalone builds.
- Verify `output` and `outputFileTracingRoot` type safety in `NextConfig`.
