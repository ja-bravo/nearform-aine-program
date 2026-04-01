# Story 1.4: Build primary capture and list surface

Status: done

## Story

As a **user**,  
I want to **open the app and immediately capture and view tasks** on a **single primary surface**,  
So that I complete the **core loop without onboarding** (FR16) and see **truth from the server** after refresh (FR11–FR13, FR18), with **clear loading and empty states** (FR7, FR8) and **responsive, accessible basics** (NFR2 baseline, NFR9 for this slice).

**Traceability:** FR1, FR2, FR5, FR7, FR8, FR16, FR18 · NFR2, NFR9

## Acceptance Criteria

1. **Home surface**  
   **Given** I visit the app root (`/`) on first or return visit  
   **When** the page renders  
   **Then** I see a **primary layout** with a **quick-capture control** always visible and a **todo list region** below or beside it (single-column calm layout per UX direction).  
   **And** the default Next.js marketing placeholder on **`apps/web/src/app/page.tsx`** is **replaced** by this experience.

2. **List loading**  
   **Given** the client is fetching todos from the API  
   **When** the initial list request is in flight  
   **Then** the list area shows an **explicit loading state** (skeleton, spinner, or concise “Loading…” — pick one pattern and reuse).  
   **And** the shell does not present an **indefinite blank list** without feedback (align with NFR2: avoid a bare empty main region while waiting).

3. **Empty state**  
   **Given** the API returns **zero todos** successfully  
   **When** the list is shown  
   **Then** I see a **friendly empty state** (copy + optional illustration) that **invites capture**, per UX empty-state pattern.

4. **Create via quick capture**  
   **Given** I enter text and submit (desktop: **Enter** in the capture field; mobile: explicit submit affordance)  
   **When** the description is **non-empty** after trim  
   **Then** the client calls **`POST ${NEXT_PUBLIC_API_BASE_URL}/api/v1/todos`** with **`{ "description": "<text>" }`** and, on success, the **new todo appears** in the list with **`description`**, **`isCompleted`** (expected `false` for new items), and **created-at** metadata visible (human-readable or ISO — document choice).  
   **And** the list order matches the API contract (**`createdAt` descending**, newest first — Story 1.3).

5. **Inline validation (empty / whitespace)**  
   **Given** I try to submit **empty** or **whitespace-only** description  
   **When** I submit  
   **Then** the app **does not** send the request  
   **And** I see **inline validation** (concise message) **without clearing** typed whitespace until I fix it (preserve user input).

6. **Persisted truth after refresh**  
   **Given** a todo was created successfully  
   **When** I **hard refresh** the browser  
   **Then** the same todo(s) **still appear**, loaded via **`GET /api/v1/todos`** (FR11–FR13, FR18).

7. **Cross-origin browser access**  
   **Given** the web app is served from **`localhost:3000`** (or compose **`WEB_PORT`**) and the API from **`localhost:3001`** (or **`API_PORT`**)  
   **When** the browser performs **`fetch`** to the configured API base URL  
   **Then** requests **succeed** from the UI (CORS headers on Fastify **or** same-origin proxy via Next — **must implement one documented approach**).  
   **And** **`NEXT_PUBLIC_API_BASE_URL`** in **`.env.example`** remains the **browser-visible** base (already set).

8. **Minimal failure visibility**  
   **Given** list load or create fails (network/API error)  
   **When** the error is returned  
   **Then** the user sees a **short, non-technical message** in context (banner, inline alert, or toast — keep minimal; full **PersistenceStatusBadge** / offline UX is Epic 3).  
   **Optional:** log or surface **`error.requestId`** from API envelope in dev-only UI — not required for MVP.

9. **Accessibility (NFR9 slice)**  
   **Given** keyboard and screen-reader use  
   **Then** the capture field has an **associated label** (visible or `aria-label`)  
   **And** focusable controls show **visible focus** (Tailwind defaults OK if not removed)  
   **And** list items are **semantic lists** (`<ul>` / `<li>` or equivalent roles).

## Tasks / Subtasks

- [x] **T0 — Enable browser → API calls** (AC: 7)  
  - [x] Add **`@fastify/cors`** (or equivalent) to **`apps/api`**, allowlist origins from env (e.g. **`CORS_ORIGIN`** comma-separated, default **`http://localhost:3000`** for local dev).  
  - [x] Document in **README** next to web/API ports.  
  - [x] _Alternative:_ Next.js **`rewrites`** proxy — only if you prefer same-origin; still document.

- [x] **T1 — Web dependencies** (architecture versions)  
  - [x] Add **`@tanstack/react-query@5.95.2`** (or compatible `^5.95`).  
  - [x] Add **`react-hook-form@7.72.0`**, **`@hookform/resolvers`**, **`zod@^4`** (match API major).  
  - [x] Add **Vitest** + **@testing-library/react** (and **jsdom**) if not present — replace **`echo "no unit tests yet"`** with a real **`pnpm --filter web test`** entry.

- [x] **T2 — Query client provider**  
  - [x] Wrap the app (e.g. **`apps/web/src/app/layout.tsx`**) with **`QueryClientProvider`** and sensible defaults (`staleTime`, `retry: false` or low — avoid chatty duplicate loads per NFR3 spirit; Epic 3 owns retry UX).

- [x] **T3 — API client + types**  
  - [x] Under **`apps/web/src/shared/api/`**: small **`fetchJson`** helper, base URL from **`process.env.NEXT_PUBLIC_API_BASE_URL`** (fail fast or log if missing in client).  
  - [x] Zod schemas for **`TodoDto`** and envelopes matching Story 1.3: list **`{ data: { todos }, meta?: { requestId } }`**, create **`{ data: todo, meta?: { requestId } }`**, error **`{ error: { code, message, requestId, ... } }`**.  
  - [x] Normalize **`ApiError`** for UI messaging.

- [x] **T4 — Feature module `todos`**  
  - [x] **`apps/web/src/features/todos/components/quick-capture-bar.tsx`** — RHF + zod resolver, Enter-to-submit on desktop, touch-friendly submit.  
  - [x] **`apps/web/src/features/todos/components/todo-list.tsx`** — loading, empty, populated states; render **`createdAt`** (use **`Intl.DateTimeFormat`** or relative helper).  
  - [x] **`apps/web/src/features/todos/hooks/use-todos-query.ts`** / **`use-create-todo-mutation.ts`** (names flexible) wrapping TanStack Query + API client.  
  - [x] Optional: **`todo-home.tsx`** client component composing bar + list; keep **`page.tsx`** mostly server wrapper if desired.

- [x] **T5 — Home page**  
  - [x] Replace **`apps/web/src/app/page.tsx`** content to render the todo home (use **`"use client"`** on the composed feature component or a dedicated client entry).  
  - [x] Remove unused starter assets from the critical path if they are no longer referenced (optional cleanup).

- [x] **T6 — Styling**  
  - [x] Tailwind-only, calm single-column layout; align with UX **8px spacing**, **Inter** (already typical in Next template).  
  - [x] Show **`isCompleted`** state visually (checkbox disabled or read-only styling OK for Epic 1 — **no toggle API** until Epic 2).

- [x] **T7 — Tests**  
  - [x] Unit/component tests: validation prevents empty POST; happy path can mock **`fetch`** or MSW.  
  - [x] Document **`pnpm --filter web test`** in README if new.

- [x] **T8 — Docs**  
  - [x] README: “Run web + API” for local dev (`pnpm dev` filters or compose), **`NEXT_PUBLIC_API_BASE_URL`**, and CORS/env note.

## Dev Notes

### API contract (Story 1.3 — do not redefine)

- **`GET /api/v1/todos`** → **`200`**, body **`{ "data": { "todos": TodoDto[] }, "meta"?: { "requestId" } }`**, order **newest first**.  
- **`POST /api/v1/todos`** → **`201`**, body **`{ "data": TodoDto, "meta"?: { "requestId" } }`**.  
- **`TodoDto`:** **`id`**, **`description`**, **`isCompleted`**, **`createdAt`** (ISO string).  
- Errors: **`{ "error": { "code", "message", "details?", "requestId" } }`**.

### Previous story intelligence (Story 1.3)

- Server implementation: **`apps/api/src/features/todos/*`**, **`registerTodosRoutes`**, **`error-envelope`**, **`genReqId`**.  
- List/query ordering is **SQL `ORDER BY created_at DESC`** — UI should not re-sort unless documenting a deliberate override.

### Repository facts (avoid wrong paths)

- Web App Router root: **`apps/web/src/app/`** (not `apps/web/app/`).  
- **`apps/web/package.json`** today: Next **16**, React **19**, Tailwind **4** — no TanStack Query yet.  
- **`.env.example`** already defines **`NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`**.

### Architecture compliance

- **Feature folder:** **`apps/web/src/features/todos/*`** [Source: architecture — Structure Patterns].  
- **Shared API helpers:** **`apps/web/src/shared/api/*`** [Source: architecture — FR mapping].  
- **Stack:** TanStack Query + RHF + zod [Source: architecture — Frontend].  
- **Styling:** Tailwind required [Source: architecture].

### UX alignment (selected)

- **QuickCaptureBar**, Enter-to-save desktop, touch-first mobile [UX: QuickCaptureBar, Quick Capture Form].  
- **Empty:** friendly, action-oriented [UX: Empty State Pattern].  
- **Loading:** visible during fetch [UX: Loading Pattern].  
- **Microcopy:** concise, supportive for errors [UX-DR15].

### Out of scope (later epics)

- **Toggle complete / delete** UI and APIs — **Epic 2**.  
- **PersistenceStatusBadge**, **offline banner**, **inline retry** — **Epic 3**.  
- **Full responsive/keyboard/a11y QA gates** — **Epic 4** (this story implements **baseline** NFR9 only).  
- **Playwright e2e** — optional follow-up; not required to mark 1.4 done unless you extend scope.

### Open questions (none blocking)

- If **`CORS_ORIGIN`** is used, ensure **Docker** web container still works when the **browser** uses **`http://localhost:3000`** and API **`http://localhost:3001`** — allowlist both as needed.

## References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.4  
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` — QuickCaptureBar, empty/loading patterns  
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — web structure, TanStack Query, shared API  
- API story: `_bmad-output/implementation-artifacts/1-3-implement-create-and-list-todos-api-contract.md`  
- README: root **`README.md`** — todos API section  

### Review Findings

- [x] [Review][Patch] When `NEXT_PUBLIC_API_BASE_URL` is unset, `useTodosQuery` is disabled so `isLoading` stays false and the list looked empty — added config alert + status copy instead of empty state [`apps/web/src/features/todos/components/todo-home.tsx`] (AC2 / misconfiguration feedback)

## Dev Agent Record

### Agent Model Used

Cursor agent (DS / bmad-dev-story)

### Debug Log References

### Completion Notes List

- **CORS:** `@fastify/cors` on API; `CORS_ORIGIN` comma-separated (default `http://localhost:3000`); `createServer` is async; OPTIONS preflight covered in `server.test.ts`. Compose passes `CORS_ORIGIN` to `api`.
- **Web:** TanStack Query provider (`staleTime` 60s, `retry: false`), `fetchJson` + Zod envelopes, `ApiError`, feature `TodoHome` / `QuickCaptureBar` / `TodoList`, RHF + `quickCaptureSchema` (whitespace-safe validation, input preserved).
- **Dates:** `createdAt` shown with `Intl.DateTimeFormat` (medium date + short time, locale default).
- **Tests:** `capture-schema.test.ts`, `quick-capture-bar.test.tsx` (no POST on empty/whitespace; mocked `fetch` happy path); `pnpm --filter web test` = Vitest.
- **README / `.env.example`:** CORS + `NEXT_PUBLIC_API_BASE_URL` documented; web test command added.

### File List

- `.env.example`
- `README.md`
- `docker-compose.yml`
- `pnpm-lock.yaml`
- `apps/api/package.json`
- `apps/api/src/index.ts`
- `apps/api/src/server.ts`
- `apps/api/src/server.test.ts`
- `apps/api/src/features/todos/todo-routes.test.ts`
- `apps/api/src/features/todos/todo.integration.test.ts`
- `apps/web/package.json`
- `apps/web/vitest.config.ts`
- `apps/web/vitest.setup.ts`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/query-provider.tsx`
- `apps/web/src/features/todos/capture-schema.ts`
- `apps/web/src/features/todos/capture-schema.test.ts`
- `apps/web/src/features/todos/hooks/use-create-todo-mutation.ts`
- `apps/web/src/features/todos/hooks/use-todos-query.ts`
- `apps/web/src/features/todos/components/quick-capture-bar.tsx`
- `apps/web/src/features/todos/components/quick-capture-bar.test.tsx`
- `apps/web/src/features/todos/components/todo-home.tsx`
- `apps/web/src/features/todos/components/todo-list.tsx`
- `apps/web/src/shared/api/api-error.ts`
- `apps/web/src/shared/api/env.ts`
- `apps/web/src/shared/api/fetch-json.ts`
- `apps/web/src/shared/api/schemas.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-4-build-primary-capture-and-list-surface.md`

## Change Log

- 2026-04-01: Story 1.4 implemented — primary todo UI, API CORS, shared fetch layer, Vitest for web, README/env/compose updates.
- 2026-04-02: Code review — missing API base URL no longer shows misleading empty list; story marked done.

---

**Story completion status:** done — Code review complete.
