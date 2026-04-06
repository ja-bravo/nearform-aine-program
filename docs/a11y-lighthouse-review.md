# Accessibility and Lighthouse review (executed)

**Scope:** `apps/web` home route (`/`) and offline-banner state for axe; Lighthouse CI against the same URL per `apps/web/.lighthouserc.js`.  
**Date:** 2026-04-06  
**Method:** Playwright + `@axe-core/playwright` (quality gate `@a11y`); Lighthouse CI `autorun` (3 runs, devtools throttling). Production path: `pnpm turbo run build --filter web --filter api`, then `pnpm --filter api start` and `pnpm --filter web start` with `wait-on` (mirrors `.github/workflows/test.yml`). **Node v20.19.2** for build, servers, and `@lhci/cli`; Playwright quality gate in this run used **Node v18.19.0** (workspace default).

## Summary

| Area | KPI source | Result |
|------|------------|--------|
| WCAG 2.2 AA (axe) | `e2e/a11y/todo-list.axe.spec.ts` — tags `wcag2aa`, `wcag22aa`; zero violations | Pass |
| Lighthouse categories & metrics | `apps/web/.lighthouserc.js` — `assert` block | Pass |

All Lighthouse CI assertions succeeded. The median uploaded HTML report: [Lighthouse report (temporary storage)](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1775487676853-51059.report.html).

---

## Accessibility (axe-core / Playwright)

### KPI

- **Rule:** No violations when scanning with `wcag2aa` and `wcag22aa` (WCAG 2.2 Level AA coverage via axe tags).
- **Surfaces:** Home page after load (including `main` and `persistence-status-badge`); full page after forcing offline and showing `offline-banner` (animations allowed to finish before scan).

### Command

`pnpm --filter web quality-gate` (runs `playwright test --project=chromium --grep "@a11y"`).

### Findings

| Check | Outcome |
|-------|---------|
| Home page — WCAG 2.2 AA | **Pass** — `violations` empty |
| Offline banner state — WCAG 2.2 AA | **Pass** — `violations` empty |

**Tests executed:** 2 passed (≈2.5s total in this run).

---

## Lighthouse CI

### KPIs (`apps/web/.lighthouserc.js`)

| Assertion | Threshold |
|-----------|-----------|
| `categories:performance` | min score **0.9** |
| `categories:accessibility` | min score **1.0** |
| `categories:best-practices` | min score **0.9** |
| `categories:seo` | min score **0.9** |
| `largest-contentful-paint` | max **2500** ms |
| `total-blocking-time` | max **200** ms |
| `cumulative-layout-shift` | max **0.1** |
| `speed-index` | max **3000** |

**Collect:** URL `http://localhost:3000/`, **3** runs, `throttlingMethod: devtools`.

### Command

From repo root, after build and with API (`3001`) and web (`3000`) serving **production** output (same shape as CI):

1. `pnpm turbo run build --filter web --filter api` (requires **Node ≥20.9** for Next.js 16).
2. Start API and web in the background with `DATABASE_URL` / `NEXT_PUBLIC_API_BASE_URL` set as for local dev.
3. From `apps/web`: `npx @lhci/cli@0.15.1 autorun --config=./.lighthouserc.js` (Lighthouse 12 needs **Node ≥18.20**; older 18.x can throw import syntax errors).

For a quick axe-only check without a production build, `pnpm --filter web quality-gate` still starts dev servers via Playwright when `SKIP_PW_WEBSERVER` is unset.

### Findings

**CI assertions:** All processed successfully; no assertion failures.

**Observed scores (three runs on this machine)** — category scores are Lighthouse’s 0–1 scale:

| Run (LHR file) | Performance | Accessibility | Best practices | SEO |
|----------------|-------------|---------------|----------------|-----|
| `lhr-1775487627549.json` | 1.0 | 1.0 | 1.0 | 1.0 |
| `lhr-1775487650861.json` | 1.0 | 1.0 | 1.0 | 1.0 |
| `lhr-1775487674944.json` | 1.0 | 1.0 | 1.0 | 1.0 |

**Core metrics (illustrative — last run `lhr-1775487674944.json`):**

| Metric | Value | KPI |
|--------|-------|-----|
| LCP | ≈1478 ms | ≤2500 ms |
| TBT | ≈33 ms | ≤200 ms |
| CLS | 0 | ≤0.1 |
| Speed Index | ≈1482 | ≤3000 |

All three runs stayed within the numeric budgets; performance category was **1.0** on each run.

### Note — best practices vs dev server

**This run** used **`next start`** (production). Category **best-practices** was **1.0** and audit **`errors-in-console`** scored **1** (pass) across all three LHRs under `apps/web/.lighthouseci/`.

If you profile with **`next dev`** or a different URL, console noise (for example hydration warnings) can lower best-practices without changing the production CI path. Treat production LHCI as the contract; use devtools/console during development to catch regressions early.

---

## Checks performed

| Area | Result |
|------|--------|
| Axe WCAG 2.2 AA (home + offline) | 0 violations; quality gate green |
| Lighthouse category floors | All ≥ configured mins |
| LCP / TBT / CLS / Speed Index | Within numeric budgets across runs |
| Lighthouse CI `assert` | All assertions passed |

---

## Suggested next steps

1. Keep **Node ≥20.9** for Next builds and **Node ≥18.20** for `@lhci/cli` locally and in CI.
2. Re-run `pnpm --filter web quality-gate` and Lighthouse `autorun` after meaningful UI or framework changes.
3. If best-practices drops in a future run, inspect `errors-in-console` in the median LHR JSON under `apps/web/.lighthouseci/` and reproduce with a non-minified React build where applicable.
