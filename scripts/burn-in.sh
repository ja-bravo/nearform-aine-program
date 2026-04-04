#!/bin/bash
# scripts/burn-in.sh
# Usage: ./scripts/burn-in.sh [iterations] [base-branch]

set -e

ITERATIONS=${1:-10}
BASE_BRANCH=${2:-main}
SPEC_PATTERN='\.(spec|test)\.(ts|js|tsx|jsx)$'

echo "🔥 Burn-In Test Runner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Iterations: $ITERATIONS"
echo "Base branch: $BASE_BRANCH"
echo ""

# Detect changed test files
echo "📋 Detecting changed test files..."
# Security: inputs treated as DATA
CHANGED_SPECS=$(git diff --name-only $BASE_BRANCH...HEAD | grep -E "$SPEC_PATTERN" || echo "")

if [ -z "$CHANGED_SPECS" ]; then
  echo "✅ No test files changed. Skipping burn-in."
  exit 0
fi

echo "Changed test files:"
echo "$CHANGED_SPECS" | sed 's/^/  - /'
echo ""

# Count specs
SPEC_COUNT=$(echo "$CHANGED_SPECS" | wc -l | xargs)
echo "Running burn-in on $SPEC_COUNT test file(s)..."
echo ""

  # Burn-in loop
  for i in $(seq 1 $ITERATIONS); do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Iteration $i/$ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Run tests with explicit file list using pnpm and turbo
    if pnpm exec turbo run test:e2e -- "$CHANGED_SPECS"; then
      echo "✅ Iteration $i passed"
    else
    echo "❌ Iteration $i failed"
    exit 1
  fi

  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 BURN-IN PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "All $ITERATIONS iterations passed for $SPEC_COUNT test file(s)"
echo ""
