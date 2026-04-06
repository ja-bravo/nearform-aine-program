# Accessibility E2E Testing

This directory contains automated accessibility scans using `@axe-core/playwright`.

## Quality Gate

Accessibility scans are part of the `quality-gate` script. They target WCAG 2.2 Level AA compliance.

Lighthouse CI budgets, how to run `autorun` against production servers, and the latest recorded scores live in the repo doc [`docs/a11y-lighthouse-review.md`](../../../../docs/a11y-lighthouse-review.md).

## Known Gaps / Exceptions

*   None. All identified a11y issues must be fixed before release.

## Troubleshooting

If a test fails due to a11y violations, the violation details are printed to the console during execution. For a visual report, run:

```bash
pnpm test:e2e --project=chromium --reporter=html
```
