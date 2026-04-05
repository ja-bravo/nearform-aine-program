---
title: 'Fix Lighthouse CI LCP and Accessibility failures'
type: 'bugfix'
created: '2026-04-05T20:20:00Z'
status: 'done'
context: ['apps/web/AGENTS.md']
baseline_commit: '4b0f9786e4fc0a40fcef5f34cb46d1deb5ebd58a'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lighthouse CI is failing with LCP > 2.5s and Accessibility < 100%. LCP is high because the entire page content is in a client component, delaying initial paint. Accessibility is low due to insufficient contrast in dark mode for completed tasks.

**Approach:** Move the static page header to a server component for faster initial paint and LCP. Update the tailwind classes for completed tasks to ensure WCAG AA contrast compliance in dark mode.

## Boundaries & Constraints

**Always:**
- Keep the design consistent with the existing zinc-based theme.
- Ensure the header remains visually identical while moving to the server.
- Maintain a minimum 4.5:1 contrast ratio for all text.

**Ask First:**
- If moving the header to the server requires significant structural changes to how `TodoHome` manages its layout.

**Never:**
- Don't change the API or state management logic.
- Don't add new dependencies.

</frozen-after-approval>

## Code Map

- `apps/web/src/app/page.tsx` -- Main entry point, move static header here.
- `apps/web/src/features/todos/components/todo-home.tsx` -- Client-side task home, remove static header from here.
- `apps/web/src/features/todos/components/todo-item-row.tsx` -- Task row component, fix dark mode contrast for completed items.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/page.tsx` -- Move the `<header>` section from `TodoHome` into this server component -- This ensures the header is in the initial HTML for faster LCP.
- [x] `apps/web/src/features/todos/components/todo-home.tsx` -- Remove the `<header>` section and adjust the layout wrapper -- Clean up client-side component to only handle interactive state.
- [x] `apps/web/src/features/todos/components/todo-item-row.tsx` -- Update the `todo.isCompleted` class from `dark:text-zinc-500` to `dark:text-zinc-400` -- Increases contrast ratio on dark background to meet WCAG AA (4.5:1).

**Acceptance Criteria:**
- Given the production build, when running Lighthouse CI, then LCP is < 2.5s.
- Given the production build, when running Lighthouse CI, then Accessibility score is 1.0 (100%).
- Given dark mode is enabled, when a task is completed, then its description has sufficient contrast (>= 4.5:1).

## Verification

**Commands:**
- `pnpm turbo run build` -- expected: build success.
- `npx @lhci/cli collect --configPath=apps/web/.lighthouserc.js && npx @lhci/cli assert --configPath=apps/web/.lighthouserc.js` -- expected: all assertions pass.
