---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - /Users/joseantoniobravoisidro/Desktop/dev/personal/nearform-aine-bmad/_bmad-output/planning-artifacts/prd.md
  - /Users/joseantoniobravoisidro/Desktop/dev/personal/nearform-aine-bmad/_bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-31'
project_name: 'nearform-aine-bmad'
user_name: 'Jose'
date: '2026-03-31'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The product requires a tightly scoped but complete todo lifecycle: create, list, complete/uncomplete, and delete tasks, with created-time visibility and clear active/completed distinction. Architecturally, this implies a stable domain model for todos, deterministic mutation semantics, and explicit state transitions between client and server.

The UX/state requirements (empty/loading/error/recovery) elevate this beyond simple CRUD scaffolding. The architecture must support explicit operational states and recovery paths without dead ends. Persistence continuity requirements (post-refresh and post-backend-restart) require durable storage with clear read/write behavior and predictable restart characteristics.

Cross-device and accessibility requirements (mobile + desktop parity, keyboard operability, accessible naming) imply shared interaction contracts and component-level semantics that cannot be deferred to later polish. v1 is explicitly single-workspace and no-auth, but architecture must preserve clean seams for later auth/multi-user introduction.

**Non-Functional Requirements:**
NFRs materially constrain architecture:
- Performance: p95 mutation responses within 500 ms, initial list load p95 within 2 s for up to 500 todos, and avoidance of redundant/chatty list requests.
- Security: HTTPS in deployment, server-side validation, safe/consistent error envelopes, and non-world-readable default posture.
- Reliability/durability: acknowledged writes survive normal API restarts; backup/recovery expectations must be documented.
- Accessibility: core flows aligned with WCAG-oriented behavior including focus visibility, keyboard completion, and non-color-only status communication.

These NFRs require early decisions on API contract shape, persistence choice, request lifecycle handling, error taxonomy, and observability hooks for latency and failure paths.

**Scale & Complexity:**
Scope is intentionally restrained (single-user todo app), but interaction trust requirements raise implementation complexity above basic CRUD demo. The architecture must support fast-feeling UX while guaranteeing truthful persistence states and graceful failure recovery.

- Primary domain: Full-stack web application (responsive client + HTTP API + persistence)
- Complexity level: Low-to-medium
- Estimated architectural components: 7-9

### Technical Constraints & Dependencies

- Product constraint: v1 excludes authentication and multi-user features, but architecture must not block future introduction.
- Interaction constraint: UI must never imply successful persistence when save failed.
- Platform constraint: responsive behavior across mobile and desktop with touch and keyboard parity.
- Data durability constraint: persisted todo data must survive normal backend restarts.
- API constraint: predictable CRUD contract with consistent status codes and payload semantics.
- Dependency direction: web client depends on stable API contract; API depends on durable datastore and validation layer.
- Operational constraint: minimal, maintainable deployment/run path suitable for a small team.

### Cross-Cutting Concerns Identified

- Client-server state consistency and reconciliation after async mutations
- Error handling and retry semantics at item-level and system-level (offline/read-only)
- Performance management (latency budgets, request efficiency, list fetch behavior)
- Security hygiene (TLS, validation, safe errors, default-closed data exposure posture)
- Reliability and recoverability (durable writes, restart behavior, documented backup expectations)
- Accessibility as a first-class implementation constraint (keyboard, focus, semantic labeling)
- Extensibility seams for future auth/multi-user without domain rewrites

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web monorepo (Next.js frontend + separate Fastify API) based on project requirements analysis and user preferences.

### Starter Options Considered

1. **Turborepo (`create-turbo`)**
   - Strengths: purpose-built monorepo tooling, task pipelines, caching, shared TS configs, clear app/package boundaries.
   - Fit: excellent for `apps/web` + `apps/api` with shared packages (types, config, utilities).
   - Trade-off: requires explicit setup for Fastify app and Docker infra (which is acceptable and desired here).

2. **Single Next.js starter only (`create-next-app`)**
   - Strengths: fastest path for frontend-only setup.
   - Fit: insufficient for the explicit separate Fastify service architecture.
   - Trade-off: would force ad-hoc monorepo retrofitting later.

3. **Community Fastify+Next boilerplates**
   - Strengths: potentially quicker initial scaffolding.
   - Fit: variable maintenance quality and opinionated choices; less predictable long-term.
   - Trade-off: higher risk versus explicit, maintained core CLIs.

### Selected Starter: Turborepo (`create-turbo`)

**Rationale for Selection:**
This provides the cleanest long-term architecture for a same-repo split between Next.js and Fastify while preserving developer ergonomics, shared typing, and test orchestration. It aligns with required Dockerized local PostgreSQL workflow and multi-layer testing strategy without locking into fragile community boilerplates.

**Initialization Command:**

```bash
pnpm dlx create-turbo@latest
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript-first monorepo conventions with shared TS config patterns.

**Styling Solution:**
Tailwind CSS is required for `apps/web`.

**Build Tooling:**
Turborepo task graph and caching for `dev`, `build`, `test`, and `lint` across apps/packages.

**Testing Framework:**
No single forced test framework at repo level; enables per-app setup:
- Unit/integration via Vitest or Jest per app
- E2E via Playwright in web app context

**Code Organization:**
Multi-app + shared packages pattern:
- `apps/web` (Next.js)
- `apps/api` (Fastify)
- `packages/*` for shared types, config, and utilities

**Development Experience:**
Consistent monorepo scripts, parallel app development, predictable CI-ready task orchestration, and clean separation of concerns.

**Follow-up scaffolding commands (post-starter):**
- Add web app: `pnpm create next-app apps/web --ts --app --eslint --src-dir --tailwind --use-pnpm`
- Scaffold API app with Fastify TypeScript CLI in `apps/api`
- Add Docker Compose for PostgreSQL and local service wiring
- Initialize Playwright for `apps/web` and unit/integration suites in both apps

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Monorepo architecture: Turborepo with `apps/web` (Next.js) and `apps/api` (Fastify), plus shared `packages/*`.
- Data access strategy: no ORM; use `@nearform/sql` for parameterized SQL queries.
- Migration strategy: SQL-first migrations with Postgrator (`8.0.0`).
- Validation strategy: `zod` (`4.x`) at API boundaries for request and response contracts.
- API contract: REST JSON with `/api/v1` path versioning and a standard error envelope.
- Frontend data and form architecture: TanStack Query (`5.95.2`) + React Hook Form (`7.72.0`) + zod resolver.
- Infrastructure baseline: Docker-first local orchestration with PostgreSQL container and required health checks.

**Important Decisions (Shape Architecture):**
- Security baseline for v1 (no auth): Helmet, CORS allowlist, request size limits, safe error responses, strict env validation.
- Styling system: Tailwind required in `apps/web`, with tokenized theming approach.
- Rendering interaction model: Next.js App Router with server-rendered initial fetch where useful and client components for mutations.
- Testing strategy: unit + integration + Playwright E2E as required suites.
- Observability baseline: structured JSON logs, request IDs, and standardized `/healthz` endpoints.
- Performance load-tool baseline: `k6` is the locked API load-testing tool for performance scenarios.

**Deferred Decisions (Post-MVP):**
- Authentication and authorization implementation details (explicitly out of v1 scope by PRD).
- Distributed cache layer (Redis) and advanced scaling strategy.
- Managed cloud deployment profile and multi-environment release automation beyond local/self-hosted baseline.

### Data Architecture

- **Database:** PostgreSQL (containerized local runtime).
- **Data access library:** `@nearform/sql` (`1.10.7`) with parameterized queries; no ORM abstraction.
- **Schema migration:** Postgrator (`8.0.0`) SQL migration files with deterministic ordering.
- **Validation boundaries:** `zod` (`4.x`) for route input/output schemas; database constraints remain authoritative for persistence integrity.
- **Caching:** none for MVP; performance via query efficiency, indexing, and request discipline.

**Rationale:** This keeps the stack explicit, auditable, and predictable for a small-scope product with strong correctness and trust requirements.

### Authentication & Security

- **Authentication:** none in v1 (single implicit workspace).
- **Authorization:** not applicable in v1; keep seams for future user scoping.
- **API hardening baseline:** Helmet, CORS allowlist, input validation, request size limits, safe/consistent error envelope, and parameterized SQL only.
- **Transport policy:** local dev can run HTTP; production profile is HTTPS-only.
- **Secrets/config:** env-driven config with fail-fast startup validation for required variables.

**Rationale:** Aligns with explicit MVP scope while still meeting NFR security expectations and avoiding rework for future auth introduction.

### API & Communication Patterns

- **API style:** REST over JSON.
- **Versioning:** path-based (`/api/v1`) from day one.
- **Contract source of truth:** zod route schemas with OpenAPI generation from schema metadata.
- **Error handling standard:** canonical envelope:
  - `error.code`
  - `error.message`
  - optional `error.details`
  - `requestId` for traceability
- **Rate limiting:** conservative limits on write endpoints in shared/non-local contexts; relaxed or disabled in local development.
- **Service communication:** direct `web -> api` only (no event bus or internal service mesh in MVP).

**Rationale:** This gives clear client/server contracts, debuggability, and low-ambiguity behavior needed for AI-assisted implementation consistency.

### Frontend Architecture

- **Framework:** Next.js App Router with TypeScript.
- **Server state management:** TanStack Query (`5.95.2`).
- **Form handling:** React Hook Form (`7.72.0`) with zod validation.
- **Styling:** Tailwind CSS required; design tokens layered through CSS variables/theme conventions.
- **State truth model:** explicit async states (`Saving`, `Saved`, `Not saved`) and offline read-only indicators per UX specification.
- **Performance stance:** optimistic updates only where persistence truth is preserved; otherwise explicit pending and reconciliation behavior.

**Rationale:** Supports fast-feeling interactions while preserving the UX requirement to never fake persistence success.

### Infrastructure & Deployment

- **Containerization:** required.
- **Dockerfiles:** separate `web` and `api` Dockerfiles with multi-stage builds, non-root runtime users, and image health checks.
- **Compose orchestration:** one `docker-compose.yml` orchestrating `web`, `api`, and `postgres` with explicit network and volumes.
- **Migration execution:** Postgrator migration job/command integrated into startup flow before API serves traffic.
- **Health checks:** app-level health endpoints and compose healthcheck wiring; logs available through `docker compose logs`.
- **Environment strategy:** env vars for dev/test with compose profiles and `.env` files plus examples.
- **CI quality gates:** lint, typecheck, unit, integration, and Playwright E2E required in pull request workflow.

**Rationale:** Establishes a reliable local-first deployment contract and clear operational behavior while staying simple for MVP.

### Decision Impact Analysis

**Implementation Sequence:**
1. Bootstrap monorepo foundation (`create-turbo`) and workspace layout.
2. Scaffold `apps/web` (Next.js + Tailwind) and `apps/api` (Fastify).
3. Set up PostgreSQL compose service, migration directory conventions, and Postgrator execution.
4. Implement API contracts with zod schemas, standard error envelope, and health endpoints.
5. Implement todo data access via `@nearform/sql` repositories and baseline indexing.
6. Implement frontend data flows with TanStack Query + RHF, including explicit persistence/offline states.
7. Wire tests (unit/integration/e2e) and CI gates.
8. Finalize Dockerfiles and compose profiles for dev/test parity.

**Cross-Component Dependencies:**
- API schema and error envelope directly shape frontend query/mutation handling and UX state messaging.
- Migration and SQL query conventions govern integration-test fixtures and local bootstrap reliability.
- Health endpoint contracts are consumed by Docker healthchecks and operational troubleshooting flows.
- Env/config schema consistency affects startup validation in both web and api services.
- No-auth v1 decisions require domain seams now to avoid auth retrofit complexity later.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 major areas where AI agents could make different choices and create integration conflicts:
- naming
- structure
- format
- communication
- process behavior

### Naming Patterns

**Database Naming Conventions:**
- Tables use `snake_case` plural nouns: `todos`, `migration_history`.
- Columns use `snake_case`: `created_at`, `is_completed`.
- Foreign keys use `<entity>_id`: `todo_id`, `user_id` (future-ready).
- Index names use `idx_<table>_<column_list>`: `idx_todos_created_at`.

**API Naming Conventions:**
- REST endpoints use plural kebab-case resources under version prefix: `/api/v1/todos`.
- Route params use `:id` style in code and path segments in URLs.
- Query parameters use `camelCase` on the HTTP interface for JS ergonomics.
- Headers use standard HTTP casing and avoid custom headers unless necessary.

**Code Naming Conventions:**
- React components: `PascalCase` (`TodoList.tsx`).
- TypeScript files (non-component): `kebab-case` (`todo-repository.ts`, `error-envelope.ts`).
- Functions/variables: `camelCase` (`createTodo`, `requestId`).
- Constants/env keys: `UPPER_SNAKE_CASE` (`DATABASE_URL`, `API_PORT`).

### Structure Patterns

**Project Organization (Hybrid Model):**
- Primary organization is feature-first in each app (`features/todos`, `features/health`).
- Shared cross-cutting modules live under `shared` only when reused by 2+ features and stable.
- Feature modules cannot import internal files from other features; only explicit public exports.
- Keep app boundaries explicit:
  - `apps/web` for UI and browser interaction.
  - `apps/api` for HTTP API and persistence orchestration.
  - `packages/*` for shared contracts/utilities/config with no app-specific runtime assumptions.

**File Structure Patterns:**
- Co-locate unit/integration tests with the code they verify (`*.test.ts[x]`).
- Keep Playwright tests in a dedicated e2e location (`apps/web/e2e`).
- Store SQL migrations in a single deterministic directory in API app (`apps/api/migrations`).
- Keep Docker assets explicit (`apps/web/Dockerfile`, `apps/api/Dockerfile`, root `docker-compose.yml`).

### Format Patterns

**API Response Formats:**
- Success response envelope:
  - `{ "data": <payload>, "meta": { ...optional } }`
- Error response envelope:
  - `{ "error": { "code": "SOME_CODE", "message": "Human-readable", "details": {...optional}, "requestId": "..." } }`
- Avoid mixed success formats across endpoints.

**Data Exchange Formats:**
- API JSON uses `camelCase` fields.
- Database and SQL stay `snake_case`; mapping occurs in repository/service boundary.
- Date/time in API responses use ISO-8601 UTC strings.
- Booleans are native `true/false` (never `0/1` at API boundary).
- `null` only when semantically meaningful; otherwise omit optional fields.

### Communication Patterns

**Event/System Patterns:**
- No internal async event bus in MVP; synchronous request/response path is authoritative.
- Health and readiness are explicit HTTP endpoints, not inferred from logs.
- If events are introduced later, naming must use dotted lower-case domain form (`todo.created`).

**State Management Patterns:**
- Server state managed with TanStack Query.
- Local UI state is minimal and component/feature scoped.
- Mutation lifecycle states must map to UX contract: `saving`, `saved`, `notSaved`.
- Write retries are user-initiated for clarity; no silent repeated write retries.

### Process Patterns

**Error Handling Patterns:**
- All API errors are normalized to the canonical envelope.
- Validation errors return predictable client-safe detail payloads.
- Logs can include internal debug context; client messages stay concise and safe.
- `requestId` is generated/preserved per request and returned in error responses.

**Loading State Patterns:**
- Initial load: explicit loading UI; never blank silent page.
- Mutation states: per-item state indicators where possible.
- Offline/read-only mode: explicit persistent indicator with clear recovery action.
- Avoid global blocking loaders for item-scoped operations.

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow hybrid structure boundaries and import rules.
- Use canonical API success/error envelopes with consistent status codes.
- Use established naming conventions (`snake_case` DB, `camelCase` API/TS).
- Keep migrations SQL-first and ordered through Postgrator.
- Preserve UX truthfulness: never represent failed writes as persisted success.

**Pattern Enforcement:**
- PR checklist includes naming, envelope, and structure conformance.
- Lint/type/test gates enforce broad consistency; contract tests enforce API format.
- Pattern updates require architecture doc update before rollout.

### Pattern Examples

**Good Examples:**
- `apps/api/src/features/todos/todo-repository.ts` using `@nearform/sql` with parameterized queries.
- API response: `{ "data": { "id": "...", "description": "...", "isCompleted": false, "createdAt": "2026-03-31T12:00:00.000Z" } }`
- API error: `{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid todo description", "requestId": "req-123" } }`
- Shared utility promoted only after confirmed multi-feature reuse in `apps/api/src/shared`.

**Anti-Patterns:**
- Mixing direct payload responses and wrapped responses across endpoints.
- Exposing DB `snake_case` fields directly in API JSON.
- Cross-feature deep imports (`features/todos` importing private files from `features/health`).
- Silent auto-retry loops for writes that hide save failures from users.
- Duplicating migration responsibility in multiple startup paths without a single source of truth.

## Project Structure & Boundaries

### Complete Project Directory Structure

```txt
nearform-aine-bmad/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .editorconfig
├── .env.example
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.test.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── quality-gates.yml
│       └── nightly-perf.yml
├── scripts/
│   ├── dev-up.sh
│   ├── test-up.sh
│   ├── migrate.sh
│   └── seed.sh
├── perf/
│   ├── budgets/
│   │   ├── web-budgets.json
│   │   └── api-budgets.json
│   ├── lighthouse/
│   │   ├── lighthouserc.json
│   │   └── todo-page.assertions.json
│   ├── devtools/
│   │   ├── web/
│   │   │   ├── todo-load.trace.mcp.ts
│   │   │   └── mutation-latency.trace.mcp.ts
│   │   └── api/
│   │       ├── list-endpoint.trace.mcp.ts
│   │       └── mutation-endpoint.trace.mcp.ts
│   └── k6/
│       ├── api-read-scenarios.js
│       └── api-write-scenarios.js
├── apps/
│   ├── web/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── api/
│   │   │       └── healthz/
│   │   │           └── route.ts
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── todos/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── quick-capture-bar.tsx
│   │   │   │   │   │   ├── todo-item-row.tsx
│   │   │   │   │   │   ├── todo-list.tsx
│   │   │   │   │   │   └── persistence-status-badge.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── use-todos-query.ts
│   │   │   │   │   │   ├── use-create-todo-mutation.ts
│   │   │   │   │   │   ├── use-update-todo-mutation.ts
│   │   │   │   │   │   └── use-delete-todo-mutation.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── todo-client-schema.ts
│   │   │   │   │   ├── adapters/
│   │   │   │   │   │   └── todo-api-adapter.ts
│   │   │   │   │   ├── state/
│   │   │   │   │   │   └── todo-ui-state.ts
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   └── todo-formatters.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── todos.test.tsx
│   │   │   │   └── healthz/
│   │   │   │       ├── hooks/
│   │   │   │       │   └── use-api-healthz.ts
│   │   │   │       └── index.ts
│   │   │   ├── shared/
│   │   │   │   ├── api/
│   │   │   │   │   ├── http-client.ts
│   │   │   │   │   ├── error-envelope.ts
│   │   │   │   │   └── request-id.ts
│   │   │   │   ├── ui/
│   │   │   │   │   ├── offline-read-only-banner.tsx
│   │   │   │   │   └── loading-state.tsx
│   │   │   │   ├── config/
│   │   │   │   │   └── env.ts
│   │   │   │   └── utils/
│   │   │   │       ├── date.ts
│   │   │   │       └── network.ts
│   │   │   └── types/
│   │   │       └── ui.ts
│   │   ├── e2e/
│   │   │   ├── todo-happy-path.spec.ts
│   │   │   ├── todo-recovery.spec.ts
│   │   │   ├── offline-read-only.spec.ts
│   │   │   ├── a11y/
│   │   │   │   ├── todo-list.axe.spec.ts
│   │   │   │   └── offline-banner.axe.spec.ts
│   │   │   └── playwright.config.ts
│   │   └── public/
│   │       └── icons/
│   └── api/
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       ├── src/
│       │   ├── app.ts
│       │   ├── server.ts
│       │   ├── features/
│       │   │   ├── todos/
│       │   │   │   ├── todo-routes.ts
│       │   │   │   ├── todo-controller.ts
│       │   │   │   ├── todo-service.ts
│       │   │   │   ├── todo-repository.ts
│       │   │   │   ├── todo-schemas.ts
│       │   │   │   ├── todo-mappers.ts
│       │   │   │   ├── index.ts
│       │   │   │   └── todo.integration.test.ts
│       │   │   └── healthz/
│       │   │       ├── healthz-routes.ts
│       │   │       ├── healthz-service.ts
│       │   │       └── healthz.test.ts
│       │   ├── shared/
│       │   │   ├── db/
│       │   │   │   ├── pg-pool.ts
│       │   │   │   ├── migration-runner.ts
│       │   │   │   └── sql-tag.ts
│       │   │   ├── http/
│       │   │   │   ├── error-envelope.ts
│       │   │   │   ├── error-codes.ts
│       │   │   │   └── request-context.ts
│       │   │   ├── plugins/
│       │   │   │   ├── helmet.ts
│       │   │   │   ├── cors.ts
│       │   │   │   ├── rate-limit.ts
│       │   │   │   └── request-id.ts
│       │   │   ├── observability/
│       │   │   │   ├── logger.ts
│       │   │   │   └── metrics.ts
│       │   │   └── config/
│       │   │       └── env.ts
│       │   └── types/
│       │       └── api.ts
│       ├── migrations/
│       │   ├── 001_create_todos.up.sql
│       │   ├── 001_create_todos.down.sql
│       │   ├── 002_add_todos_indexes.up.sql
│       │   └── 002_add_todos_indexes.down.sql
│       └── test/
│           ├── fixtures/
│           └── helpers/
└── packages/
    ├── contracts/
    │   ├── package.json
    │   └── src/
    │       ├── todo.ts
    │       ├── api-errors.ts
    │       └── index.ts
    ├── config/
    │   ├── package.json
    │   └── src/
    │       ├── eslint/
    │       ├── typescript/
    │       └── prettier/
    └── test-utils/
        ├── package.json
        └── src/
            ├── api-test-client.ts
            ├── db-fixtures.ts
            └── index.ts
```

### Architectural Boundaries

**API Boundaries:**
- Public API surface only under `apps/api/src/features/*/*-routes.ts` with `/api/v1/*`.
- No direct database access outside repositories and `shared/db`.
- Health boundary is explicit and standardized:
  - Web container health endpoint: `/healthz`
  - API liveness endpoint: `/healthz/live`
  - API readiness endpoint: `/healthz/ready`

**Component Boundaries:**
- `apps/web/src/features/*` owns feature-specific components, hooks, schemas, and local state.
- `apps/web/src/shared/*` is only for stable cross-feature primitives.
- Features do not import private files from other features; only exported feature APIs.

**Service Boundaries:**
- `web` communicates only with `api` over HTTP.
- `api` communicates with `postgres` through pooled clients in `shared/db`.
- No internal async event bus in MVP.

**Data Boundaries:**
- SQL schema source of truth is `apps/api/migrations`.
- Database naming is `snake_case`; API payload naming is `camelCase`.
- zod enforces API boundary contracts; database constraints enforce persistence integrity.

### Requirements to Structure Mapping

**Feature Mapping:**
- FR1-FR6 (todo lifecycle + state clarity): `apps/web/src/features/todos`, `apps/api/src/features/todos`, and `apps/api/migrations/*todos*`.
- FR7-FR10 (loading/error/recovery): `apps/web/src/shared/ui`, `apps/web/src/features/todos/components`, and `apps/api/src/shared/http/error-envelope.ts`.
- FR11-FR13 (durability and continuity): `apps/api/src/features/todos/todo-repository.ts`, migration files, and compose volume configuration.
- FR14-FR15 (mobile + desktop): Tailwind configuration and responsive feature components in `apps/web`.
- FR16 (no onboarding flow required): `apps/web/app/page.tsx` and `apps/web/src/features/todos/components/quick-capture-bar.tsx` as immediate-first-action surface.
- FR17 (single implicit workspace, no auth in v1): no auth module in `apps/api`; tenancy seams deferred and documented in architecture decisions.
- FR18 (successful changes must reflect persisted truth): `apps/web/src/features/todos/hooks/*mutation.ts`, `apps/web/src/features/todos/state/todo-ui-state.ts`, and canonical API envelope handling in `apps/web/src/shared/api/error-envelope.ts`.
- FR19-FR20 (accessibility): component semantics in `apps/web` plus e2e/a11y coverage under `apps/web/e2e/a11y`.

**Cross-Cutting Concerns:**
- Security: `apps/api/src/shared/plugins/*`, env config, compose network policy.
- Observability: request-id plugin, structured logger, and health endpoints.
- Quality gates: Playwright, axe-core, Lighthouse, DevTools MCP traces, and `k6` API load scenarios.
- Container operations: Dockerfiles per app + compose healthcheck wiring.

### Integration Points

**Internal Communication:**
- Web feature hooks call shared HTTP client adapters.
- API routes delegate to service and repository layers.
- Shared contracts package provides stable DTO/error types for both apps.

**External Integrations:**
- PostgreSQL (containerized).
- No third-party auth/payment/integration dependency in MVP.
- Optional OpenAPI generation from route schemas for internal developer tooling.

**Data Flow:**
- UI action -> mutation hook -> API route -> zod validation -> service -> SQL repository -> DB.
- API response/error envelope -> web adapter normalization -> UI reconciliation (`saving`/`saved`/`notSaved`).
- Health probes -> compose healthchecks -> service readiness gating.

### File Organization Patterns

**Configuration Files:**
- Root: workspace, turbo, compose, CI.
- App-local: framework/runtime/env config.
- Shared package: lint/type/format standards.

**Source Organization:**
- Hybrid structure: feature-first plus shared core.
- Promotion to shared only after proven multi-feature reuse.

**Test Organization:**
- Unit/integration tests co-located with feature code.
- E2E functional tests under `apps/web/e2e`.
- Accessibility checks under `apps/web/e2e/a11y`.
- Performance diagnostics under root `perf/` for both web and API (Lighthouse + DevTools MCP + `k6` API load scenarios).

**Asset Organization:**
- Static assets in `apps/web/public`.
- No separate backend asset pipeline needed for MVP.

### Development Workflow Integration

**Development Server Structure:**
- Compose launches `postgres`, `api`, and `web`.
- Profiles support dev/test variants with environment-specific overrides.

**Build Process Structure:**
- Turborepo pipelines run `lint`, `typecheck`, `test`, and `build`.
- Multi-stage Docker builds produce runtime images with non-root users.

**Deployment Structure:**
- Local-first deployment uses compose base + override files.
- Test environment uses compose test overlay and quality gate workflows.
- Logging and health checks are standardized for `docker compose logs` and readiness checks.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All core decisions are compatible and non-contradictory:
- Next.js + Fastify monorepo split aligns with defined service boundaries.
- `@nearform/sql` + Postgrator + PostgreSQL supports explicit data control and migration safety.
- Tailwind + TanStack Query + React Hook Form + zod supports UX responsiveness and state truthfulness.
- Docker compose overlays support local development and test isolation.
- Root-level `perf/` supports both web and API performance validation consistently.

**Pattern Consistency:**
Implementation patterns align with architecture:
- Naming conventions are coherent across database, API, and TypeScript layers.
- Hybrid structure rules reduce cross-feature coupling conflicts.
- Canonical success/error envelopes align with frontend reconciliation patterns.
- Loading/error/retry/offline process patterns are compatible with UX constraints.

**Structure Alignment:**
Project structure supports all architectural decisions:
- App and shared boundaries are explicit and enforceable.
- Test, quality, and performance assets are correctly located for CI and local execution.
- Migration, healthcheck, and logging responsibilities are clearly assigned.

### Requirements Coverage Validation ✅

**Feature Coverage:**
All functional requirement categories are supported by architecture and structure mappings.

**Functional Requirements Coverage:**
- CRUD lifecycle, state clarity, recovery behavior, persistence continuity, and cross-device support are all represented in component/service/data boundaries.
- Accessibility-focused interactions are covered through component semantics and dedicated a11y test placement.

**Non-Functional Requirements Coverage:**
- Performance: root `perf/` budgets and diagnostics cover web and API, with `k6` as the locked API load-testing tool.
- Security: hardening baseline and safe error contracts are defined.
- Reliability: migrations, standardized `/healthz` endpoints, and restart-safe persistence are specified.
- Accessibility: axe-core and Lighthouse quality gates are incorporated.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Critical decisions are documented with clear rationale and implementation sequence.
- Deferred decisions are explicitly separated from MVP-critical architecture.

**Structure Completeness:**
- Project tree is concrete and implementation-oriented.
- Integration points and ownership boundaries are explicit.

**Pattern Completeness:**
- Naming, structure, format, communication, and process patterns include enforceable rules and examples.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps (non-blocking, recommended before implementation starts):**
1. Define per-endpoint API status code matrix.
2. Lock migration execution mode in compose (one-shot job vs startup hook) to avoid race conditions.
3. Finalize numeric thresholds in `perf/budgets/*` directly from NFR targets.
4. Define CI failure policy for Lighthouse, axe-core, and performance budgets.

**Nice-to-Have Gaps:**
- Add ADR identifiers for future architecture revisions.
- Add endpoint-level contract examples in `packages/contracts`.

### Validation Issues Addressed

- Updated performance testing structure to root `perf/` for web + API coverage.
- Extended quality gate definition to include API load scenarios in addition to browser-centric checks.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack specified
- [x] Integration patterns defined
- [x] Performance, security, and accessibility addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Boundaries and integration points mapped
- [x] Requirements-to-structure mapping completed
- [x] Quality and performance tooling placement defined

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clear boundaries and consistency rules for multi-agent implementation.
- Strong local operational model (Docker, health, env profiles).
- Integrated quality strategy across functional, accessibility, and performance testing.
- Unified performance strategy for both web and API.

**Areas for Future Enhancement:**
- Formal ADR governance for architecture evolution.
- Post-MVP auth/multi-user architecture package.
- Production deployment profile when moving beyond local-first scope.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow documented boundaries and naming/format rules strictly.
- Use canonical API envelopes and error contracts consistently.
- Keep migration discipline and persistence truthfulness non-negotiable.
- Enforce quality gates for functional, accessibility, and performance checks.

**First Implementation Priority:**
Initialize monorepo foundation and scaffold `apps/web` + `apps/api` + compose baseline, then deliver the first vertical todo slice with migrations, health endpoints, and test harness.
