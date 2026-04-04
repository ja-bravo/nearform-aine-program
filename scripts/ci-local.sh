#!/bin/bash
# scripts/ci-local.sh
# Mimics the CI environment locally

set -e

echo "🏗️  Simulating CI environment locally..."

echo "1. Linting..."
pnpm turbo run lint

echo "2. Typechecking..."
pnpm turbo run typecheck

echo "3. Unit Tests..."
DATABASE_URL=postgresql://todo:todo@localhost:5432/todo RUN_DB_TESTS=1 pnpm turbo run test

echo "4. Building..."
pnpm turbo run build

echo "5. E2E Tests..."
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 DATABASE_URL=postgresql://todo:todo@localhost:5432/todo pnpm turbo run test:e2e

echo "✅ Local CI simulation complete."
