# Project Overview

## Summary

**nearform-aine-bmad** is a full-stack Todo application built as a Turborepo monorepo. It demonstrates production-grade patterns including server-side rendering, optimistic UI updates, offline resilience, comprehensive testing (unit, E2E, accessibility, performance), and containerized deployment.

## Architecture

```mermaid
flowchart LR
    Browser -->|REST / JSON| Web["apps/web\nNext.js 16"]
    Web -->|SSR fetch| API["apps/api\nFastify 5"]
    Browser -->|Client fetch| API
    API -->|@nearform/sql| PG[(PostgreSQL 16)]
```

**Repository type:** Monorepo (Turborepo + pnpm workspaces)

## Parts

| Part | Type | Tech Stack | Root |
|------|------|-----------|------|
| **API Service** | Backend | Fastify 5, PostgreSQL 16, @nearform/sql, Zod 4, Postgrator | `apps/api` |
| **Web Frontend** | Web | Next.js 16 (App Router), React 19, TanStack Query 5, Tailwind CSS 4, RHF | `apps/web` |
| **UI Components** | Library | React 19, TypeScript 5.9 | `packages/ui` |

Supporting packages: `packages/eslint-config`, `packages/typescript-config`

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Monorepo | Turborepo | 2.9.3 |
| Package manager | pnpm | 9.0.0 |
| Runtime | Node.js | ≥ 18 |
| Language | TypeScript | 5.9.2 |
| API framework | Fastify | 5.2.1 |
| Web framework | Next.js | 16.2.2 |
| UI library | React | 19.2.4 |
| Server state | TanStack Query | 5.95.2 |
| Forms | React Hook Form | 7.72.0 |
| Styling | Tailwind CSS | 4 |
| Validation | Zod | 4 |
| Database | PostgreSQL | 16 |
| Database driver | pg | 8.14.1 |
| Query builder | @nearform/sql | 1.10.7 |
| Migrations | Postgrator | 8.0.0 |
| Unit testing | Vitest | 3.2.4 |
| E2E testing | Playwright | 1.59.1 |
| Accessibility | @axe-core/playwright | 4.11.1 |
| Performance | k6 | — |
| CI | GitHub Actions | — |
| Containers | Docker Compose | — |
| Code quality | ESLint 9, Prettier 3.7 | — |

## Key Architectural Decisions

1. **No ORM** — raw SQL via `@nearform/sql` for full query control
2. **Feature-first layout** — domain logic under `features/<name>/` with co-located tests
3. **Zod everywhere** — request, response, form, and environment validation
4. **Server-first rendering** — SSR data loading with client hydration
5. **Optimistic UI via Context** — instant feedback, no cache invalidation round-trips
6. **Explicit persistence states** — never fake success; show saving/saved/error
7. **Offline resilience** — read-only mode with connectivity banner
8. **Comprehensive quality gates** — unit, E2E, a11y (axe), performance (k6, Lighthouse) in CI

## Domain

The application manages a single resource: **Todos**. Users can create, list, toggle completion, and delete todos. The API exposes a versioned REST interface at `/api/v1/todos`.
