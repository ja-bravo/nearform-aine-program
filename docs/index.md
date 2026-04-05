# Project Documentation Index

## Project Overview
- **Type:** monorepo with 3 parts
- **Primary Language:** TypeScript
- **Architecture:** Monorepo (Turbo, pnpm)

## Quick Reference

#### API Service (api)
- **Type:** backend
- **Tech Stack:** Fastify, PostgreSQL, Zod, Vitest
- **Root:** `apps/api`

#### Web Frontend (web)
- **Type:** web
- **Tech Stack:** Next.js (App Router), React, Tailwind CSS, TanStack Query, Vitest, Playwright
- **Root:** `apps/web`

#### UI Components (ui)
- **Type:** library
- **Tech Stack:** React, TypeScript
- **Root:** `packages/ui`

## Generated Documentation
- [Project Overview](./project-overview.md)
- [Architecture - API Service](./architecture-api.md)
- [Architecture - Web Frontend](./architecture-web.md)
- [Architecture - UI Components](./architecture-ui.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [API Contracts - API Service](./api-contracts-api.md)
- [Data Models - API Service](./data-models-api.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)

## Existing Documentation
- [Root README](../README.md)
- [Web README](../apps/web/README.md)
- [CI Documentation](./ci.md)
- [CI Secrets Checklist](./ci-secrets-checklist.md)

## Getting Started
To get started with development, please refer to the [Development Guide](./development-guide.md).
