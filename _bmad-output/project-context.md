---
project_name: 'nearform-aine-bmad'
user_name: 'Jose'
date: '2026-04-05'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 27
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Monorepo:** Turborepo (^2.9.3), pnpm (9.0.0), Node (>=18)
- **Web App (Next.js):** Next.js (16.2.2) App Router, React (19.2.4), TanStack Query (5.95.2), Tailwind CSS (^4), React Hook Form (7.72.0), Zod (^4)
- **API App (Fastify):** Fastify (^5.2.1), @nearform/sql (1.10.7), Postgrator (8.0.0), pg (^8.14.1), Zod (^4)
- **Testing:** Vitest (3.2.4), Playwright (^1.59.1), @axe-core/playwright (^4.11.1), k6 (Performance)
- **Quality:** Prettier (^3.7.4), ESLint (^9), TypeScript (5.9.2)

---

## Critical Implementation Rules

### Language-Specific Rules

- **Strict TypeScript:** `strict` mode is mandatory; use `ESNext` target for modern features.
- **Named Exports:** Prefer named exports over default exports for components and utilities to improve grep-ability.
- **Path Aliases:** Use `@/` for absolute imports within apps; cross-package imports must use public package exports.
- **Strict I/O Validation:** Use Zod for runtime validation at every boundary (API, Env, DB).

### Framework-Specific Rules

- **Next.js App Router:** Use `app/` directory; prefer Server Components; use `'use client'` only for necessary interactivity.
- **Fastify Plugin Architecture:** Organize shared logic (DB, errors, logging) as plugins in `shared/plugins/`.
- **Zod-Powered Routes:** Every Fastify route MUST define Zod schemas for `body`, `querystring`, `params`, and `response`.
- **Explicit Persistence State:** UI must never "fake" success; show `saving` and wait for API confirmation before showing `saved`.

### Testing Rules

- **Co-location:** Unit/integration tests (`*.test.ts[x]`) must be co-located with the source code.
- **Database Integration:** Prefer real PostgreSQL containers for integration tests; use `db-fixtures` from `packages/test-utils`.
- **Accessibility & Performance:** Every major feature MUST include an `axe-core` check and verify `k6` latency targets.
- **Minimum Coverage:** **70% minimum coverage required** for all core feature logic.

### Code Quality & Style Rules

- **Standard Formatting:** 2-space indentation, semicolons, single quotes, and trailing commas.
- **Consistent Naming:** `PascalCase` for Components, `kebab-case` for non-component files, `camelCase` for vars/fns, `UPPER_SNAKE_CASE` for constants, `snake_case` for DB.
- **Feature-First:** Organize by feature (`features/todos/`); use `index.ts` for public API exports.
- **No Narrative Comments:** Avoid comments that describe "what" the code does; only explain the "why" if non-obvious.

### Development Workflow Rules

- **Conventional Commits:** Use feature-based branches and the Conventional Commits specification.
- **PR Standards:** PRs require a descriptive body ("why" and "what") and a checklist verifying tests, a11y, and performance.
- **Docker-First:** All apps must be containerized; use Docker Compose for local development and testing.

### Critical Don't-Miss Rules

- **No ORM:** NEVER introduce an ORM; use `@nearform/sql` with parameterized queries only.
- **No `snake_case` in API:** Never expose DB fields directly; map all API JSON to `camelCase`.
- **Green Pipeline Mandatory:** A feature is **never complete** until tests, lint, and E2E all pass green.
- **Resilient UI:** Handle offline states (show banner) and persistence failures (show `notSaved` with retry).
- **Safety First:** No internal stack traces in errors; use the standard error envelope with `VALIDATION_ERROR` or `INTERNAL_SERVER_ERROR`.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code.
- Follow ALL rules exactly as documented; when in doubt, prefer the more restrictive option.
- Update this file if new recurring patterns or "gotchas" emerge.

**For Humans:**
- Keep this file lean and focused on agent needs; remove rules that become obvious over time.
- Update when the technology stack or core architecture changes.
- Review quarterly to ensure rules remain actionable and accurate.

Last Updated: 2026-04-05
