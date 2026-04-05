# Architecture - API Service (api)

## Executive Summary
The API service is a Fastify-based REST API that manages the backend logic and data persistence for the application. It follows a feature-based architecture pattern.

## Technology Stack
- **Framework:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Query Builder:** `@nearform/sql`
- **Validation:** Zod
- **Testing:** Vitest

## Architecture Pattern: Layered Features
The service is organized into features under `src/features/`. Each feature typically includes:
- **Routes:** API endpoint definitions.
- **Repository:** Data access logic using PostgreSQL.
- **Schemas:** Zod schemas for request/response validation.
- **Mappers:** Functions to map between database and API models.

## Data Architecture
- **Database:** PostgreSQL
- **Migrations:** Managed by `postgrator` (see `apps/api/migrations/`).
- **Data Models:** [Data Models - API Service](./data-models-api.md)

## API Design
- **Style:** RESTful
- **Validation:** Zod schemas for all inputs and outputs.
- **Error Handling:** Standardized error envelopes for consistent API responses.

## Key Components
- **Server:** `src/server.ts` configures Fastify and registers plugins/routes.
- **Database Pool:** `src/shared/db/pool.ts` manages the PostgreSQL connection pool.

## Source Tree
- `src/features/todos/`: Implementation of the Todo feature.
- `src/shared/db/`: Database connection and migration utilities.
- `src/shared/http/`: HTTP response and error handling utilities.

## Development Workflow
- **Dev Mode:** `pnpm dev` (uses `tsx watch`).
- **Build:** `pnpm build` (transpiles to `dist/`).
- **Tests:** `pnpm test` (runs Vitest).

## Deployment Architecture
- **Docker:** `apps/api/Dockerfile` provides the container image.
- **CI/CD:** GitHub Actions workflow `test.yml` handles testing and builds.
