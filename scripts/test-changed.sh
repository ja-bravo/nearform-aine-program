#!/bin/bash
# scripts/test-changed.sh
# Runs unit tests for changed packages

set -e

BASE_BRANCH=${1:-main}

echo "🎯 Running tests for changed packages..."
# Detect changed files and find packages
# This is a simple implementation for Turbo
pnpm exec turbo run test --filter="[origin/$BASE_BRANCH...HEAD]"
