# Project Overview - nearform-aine-bmad

## Executive Summary
This project is a monorepo containing a full-stack application for managing Todos. It features a Fastify-based REST API, a Next.js web frontend, and a shared UI component library. The project emphasizes type safety, performance, and accessibility.

## Tech Stack Summary
| Category | Technology |
| :--- | :--- |
| **Monorepo Tool** | Turbo |
| **Package Manager** | pnpm |
| **Language** | TypeScript |
| **Backend Framework** | Fastify |
| **Frontend Framework** | Next.js (App Router), React |
| **Database** | PostgreSQL |
| **Data Fetching** | TanStack Query |
| **Styling** | Tailwind CSS |
| **Testing** | Vitest, Playwright, k6 |

## Repository Structure
- **apps/api**: Fastify REST API.
- **apps/web**: Next.js web application.
- **packages/ui**: Shared React UI components.
- **packages/eslint-config**: Shared ESLint configuration.
- **packages/typescript-config**: Shared TypeScript configuration.

## Key Documentation
- [Architecture - API Service](./architecture-api.md)
- [Architecture - Web Frontend](./architecture-web.md)
- [Architecture - UI Components](./architecture-ui.md)
- [API Contracts - API Service](./api-contracts-api.md)
- [Data Models - API Service](./data-models-api.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)
