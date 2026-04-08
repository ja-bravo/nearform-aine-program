# Project Documentation Index

## Project Overview
- **Type:** Monorepo with 3 parts
- **Primary Language:** TypeScript
- **Architecture:** Turborepo + pnpm workspaces

## Quick Reference

#### API Service (api)
- **Type:** Backend
- **Tech Stack:** Fastify 5, PostgreSQL 16, @nearform/sql, Zod 4, Vitest
- **Root:** `apps/api`

#### Web Frontend (web)
- **Type:** Web
- **Tech Stack:** Next.js 16 (App Router), React 19, TanStack Query 5, Tailwind CSS 4, Playwright
- **Root:** `apps/web`

#### UI Components (ui)
- **Type:** Library
- **Tech Stack:** React 19, TypeScript 5.9
- **Root:** `packages/ui`

## Generated Documentation

### Core
- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)

### Architecture (per part)
- [Architecture — API Service](./architecture-api.md)
- [Architecture — Web Frontend](./architecture-web.md)
- [Architecture — UI Components](./architecture-ui.md)

### API & Data
- [API Contracts — API Service](./api-contracts-api.md)
- [Data Models — API Service](./data-models-api.md)

### Operations
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)
- [CI Pipeline](./ci.md)
- [CI Secrets Checklist](./ci-secrets-checklist.md)

### Quality & Security
- [Security Review](./security-review.md)
- [Accessibility & Lighthouse Review](./a11y-lighthouse-review.md)

## Process Documentation
- [AI Integration Log](./ai-integration.md)

## Existing Documentation
- [Root README](../README.md)
- [Web README](../apps/web/README.md)

## Getting Started
To get started with development, see the [Development Guide](./development-guide.md).
For deployment and CI, see the [Deployment Guide](./deployment-guide.md).
