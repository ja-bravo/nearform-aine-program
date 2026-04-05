# Deployment Guide

## Infrastructure Requirements
- Container orchestration (e.g., Kubernetes, AWS ECS) or serverless platform.
- PostgreSQL database service.

## CI/CD Pipeline
The project uses GitHub Actions for continuous integration.
- **Workflow:** `.github/workflows/test.yml`
- **Steps:**
  - Linting
  - Type checking
  - Unit and integration tests
  - E2E tests (Playwright)
  - Performance tests (k6)

## Deployment Process

### 1. Build Container Images
Use the Dockerfiles provided in each app:
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`

### 2. Environment Configuration
Ensure the following environment variables are set in the deployment environment:
- **API:** `DATABASE_URL`, `PORT`, `CORS_ORIGIN`.
- **Web:** `API_URL` (pointing to the deployed API).

### 3. Database Migrations
Run migrations before or during deployment of the API service using `pnpm migrate`.
