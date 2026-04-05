# Development Guide

## Prerequisites
- Node.js >= 18
- pnpm 9.x
- PostgreSQL instance (for API service)

## Initial Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Create `.env` files in `apps/api` and `apps/web` based on the provided patterns.

## Development Commands
From the project root:

- **Run all apps in dev mode:**
  ```bash
  pnpm dev
  ```
- **Build all parts:**
  ```bash
  pnpm build
  ```
- **Run all tests:**
  ```bash
  pnpm test
  ```
- **Lint the whole project:**
  ```bash
  pnpm lint
  ```

## Local Development (API)
1. Ensure PostgreSQL is running.
2. Run migrations:
   ```bash
   cd apps/api && pnpm migrate
   ```
3. Start the API:
   ```bash
   pnpm dev --filter api
   ```

## Local Development (Web)
1. Start the web app:
   ```bash
   pnpm dev --filter web
   ```
2. The app will be available at `http://localhost:3000`.

## Testing
- **Unit/Integration:** `pnpm test`
- **E2E:** `pnpm test:e2e` (requires apps to be running)
- **Performance:** `pnpm test:perf` (requires k6)
