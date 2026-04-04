---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - /Users/joseantoniobravoisidro/Desktop/dev/personal/nearform-aine-bmad/_bmad-output/planning-artifacts/prd.md
  - /Users/joseantoniobravoisidro/Desktop/dev/personal/nearform-aine-bmad/_bmad-output/planning-artifacts/architecture.md
  - /Users/joseantoniobravoisidro/Desktop/dev/personal/nearform-aine-bmad/_bmad-output/planning-artifacts/ux-design-specification.md
---

# nearform-aine-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for nearform-aine-bmad, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can add a new todo with a text description.  
FR2: User can view all todos together in one list.  
FR3: User can change a todo between incomplete and complete.  
FR4: User can delete a todo.  
FR5: User can see when each todo was created.  
FR6: User can tell at a glance which todos are complete versus active.  
FR7: User sees an explicit empty state when there are no todos.  
FR8: User sees that todo data is loading before the list is shown.  
FR9: User is notified when loading or saving todos fails.  
FR10: User can recover from a failed load or save (for example via retry or refresh) without abandoning the app.  
FR11: System keeps todos available after the user refreshes the browser.  
FR12: System keeps todos available after the backend service restarts under normal operation.  
FR13: After reload, the list the user sees matches the persisted todos.  
FR14: User can perform all core todo actions on a narrow, mobile-class viewport.  
FR15: User can perform all core todo actions on a desktop-class viewport.  
FR16: User can complete the core todo flow without a separate onboarding or tutorial.  
FR17: User works in a single implicit workspace with no sign-in or account management in v1.  
FR18: After a successful change, what the user sees reflects the persisted todo set (no unexplained mismatch).  
FR19: User can complete core todo actions using only the keyboard.  
FR20: Core interactive elements expose an accessible name and role to assistive technologies.
FR21: System must include at least 5 Playwright E2E tests covering core journeys (create, list, complete, delete, recovery).
FR22: System must include k6 performance tests that validate NFR1 and NFR2 (latency and load targets).

### NonFunctional Requirements

NFR1: Under single-user use and typical broadband/mobile LTE conditions, create/update/delete/list complete with server response received by the client within 500 ms at p95 in a production-like environment (excluding client render time).  
NFR2: Initial load of up to 500 todos completes server processing within 2 s at p95; UI must not show a blank screen without a loading indicator for more than 100 ms after shell paint.  
NFR3: Client avoids unnecessary duplicate or chatty requests for the same list during a single session under normal use.  
NFR4: All browser-to-API traffic in deployed environments uses TLS (HTTPS).  
NFR5: API validates inputs and returns safe, consistent errors without leaking stack traces or internal paths to end users.  
NFR6: Persistent storage and API surface are not world-readable by default (no anonymous bulk export or open admin endpoints in production configuration).  
NFR7: After API acknowledges a successful write, a normal API process restart does not lose that write.  
NFR8: System documents backup/recovery expectations suitable for MVP production deployments.  
NFR9: Core flows (add, list, complete/incomplete, delete) conform to WCAG 2.2 Level AA for shipped custom interactions, with known gaps documented and remediated.  
NFR10: Focus order and visible focus indicators support keyboard-only completion of core flows without traps.
NFR11: Codebase must maintain at least 70% total test coverage (unit and integration).

### Additional Requirements

- Use Turborepo as the starter template (`pnpm dlx create-turbo@latest`) and make bootstrap the first implementation story.
- Implement the architecture as a monorepo with `apps/web` (Next.js) and `apps/api` (Fastify), plus shared `packages/*`.
- Use PostgreSQL for durable persistence with SQL-first migrations via Postgrator.
- Use `@nearform/sql` parameterized SQL queries (no ORM abstraction).
- Use zod at API boundaries for request/response validation and schema-driven contracts.
- Implement REST JSON API with `/api/v1` versioning and canonical success/error envelopes.
- Apply API security baseline: Helmet, CORS allowlist, request size limits, safe errors, fail-fast env validation.
- Set production transport policy to HTTPS-only.
- Implement explicit health endpoints and compose health checks (`/healthz`, API liveness/readiness).
- Add structured JSON logs and request IDs for observability and traceability.
- Implement Dockerized local orchestration with `docker-compose` for web, api, and postgres.
- Define a single migration execution path before API serves traffic to avoid race conditions.
- Enforce mapping between DB `snake_case` and API `camelCase` fields at boundary layers.
- Maintain no-auth v1 behavior while preserving seams for future auth/multi-user support.
- Use TanStack Query for server state and React Hook Form + zod resolver for form handling.
- Use Tailwind as required styling foundation with tokenized theming conventions.
- Keep write retries user-initiated; avoid silent auto-retry loops that hide failures.
- Implement quality gates: lint, typecheck, unit, integration, Playwright e2e, and performance checks (including k6 for API load scenarios).

### UX Design Requirements

UX-DR1: Implement a single-primary-surface interface centered on quick capture and the task list, minimizing navigation noise.  
UX-DR2: Build a `QuickCaptureBar` component supporting desktop Enter-to-save and mobile touch-first add behavior.  
UX-DR3: Ensure first-action speed by keeping primary capture always visible; auto-focus on suitable desktop contexts.  
UX-DR4: Implement explicit persistence lifecycle states (`Saving`, `Saved`, `Not saved`) at item level.  
UX-DR5: Implement a `PersistenceStatusBadge` (or equivalent) that always pairs semantic color with text labels.  
UX-DR6: Implement an `OfflineReadOnlyBanner` with calm warning tone and clear guidance when writes are unavailable.  
UX-DR7: Implement `RetryInlineAction` on failed items so recovery occurs in context and per-item.  
UX-DR8: Preserve failed user input and keep failed items visible; never fake persistence success.  
UX-DR9: Implement clear active/completed visual distinction with progress-reinforcing completion feedback.  
UX-DR10: Apply the selected visual direction (spacious calm layout + explicit status communication patterns).  
UX-DR11: Implement design tokens for core palette, spacing (8px base), typography (Inter-first), and semantic status colors.  
UX-DR12: Ensure empty, loading, error, and offline states are explicit, actionable, and non-blocking when possible.  
UX-DR13: Implement responsive behavior across mobile/tablet/desktop breakpoints while preserving the same interaction model.  
UX-DR14: Ensure accessibility coverage for keyboard operability, visible focus, semantic labels, non-color-only status cues, and touch target sizing.  
UX-DR15: Use concise, supportive microcopy for warnings/errors to preserve trust and reduce anxiety.

### FR Coverage Map

FR1: Epic 1 - Create todo
FR2: Epic 1 - View list
FR3: Epic 2 - Toggle completion
FR4: Epic 2 - Delete todo
FR5: Epic 1 - Show created timestamp
FR6: Epic 2 - Active vs completed clarity
FR7: Epic 4 - Empty state quality across devices/a11y
FR8: Epic 3 - Loading state visibility
FR9: Epic 3 - Error notification
FR10: Epic 3 - Recovery and retry
FR11: Epic 1 - Persistence after refresh
FR12: Epic 1 - Persistence after backend restart
FR13: Epic 1 - Reload state correctness
FR14: Epic 4 - Mobile core actions
FR15: Epic 4 - Desktop core actions
FR16: Epic 1 - No onboarding required
FR17: Epic 1 - Single implicit workspace (no auth)
FR18: Epic 1/2/3 - UI must reflect persisted truth
FR19: Epic 4 - Keyboard-only completion of core flows
FR20: Epic 4 - Accessible names/roles
FR21: Epic 5 - Automated E2E verification (Playwright)
FR22: Epic 5 - Automated performance verification (k6)

## Epic List

### Epic 1: Launch the Trusted Todo Foundation
Users can open the app, capture todos immediately, view them, and trust persistence across refresh/restart in a single-user workspace.
**FRs covered:** FR1, FR2, FR5, FR11, FR12, FR13, FR16, FR17, FR18

### Epic 2: Complete and Manage Tasks with Clarity
Users can complete/uncomplete and delete tasks with clear active/completed distinction and progress feedback.
**FRs covered:** FR3, FR4, FR6, FR18

### Epic 3: Handle Failures and Recovery Without Losing Trust
Users can understand loading/error/offline states and recover from failed operations with explicit retry paths and truthful status.
**FRs covered:** FR8, FR9, FR10, FR18

### Epic 4: Deliver Cross-Device Accessible Experience
Users can perform the full core flow on mobile and desktop with keyboard support and accessible semantics.
**FRs covered:** FR14, FR15, FR19, FR20, FR7

### Epic 5: Quality and Performance Assurance
Establish a robust quality gate by implementing comprehensive E2E tests and performance scenarios that validate functional correctness and NFR compliance.
**FRs covered:** FR21, FR22

## Epic 1: Launch the Trusted Todo Foundation

Enable users to open the app and immediately capture and view trustworthy todos that persist across refreshes and normal backend restarts.

### Story 1.1: Set up initial project from starter template

As a maintainer,  
I want a working Turborepo with web, API, and Postgres orchestration,  
So that the product can run consistently in local and CI environments.

**FRs implemented:** FR16, FR17
**NFRs implemented:** NFR4, NFR5, NFR6

**Acceptance Criteria:**

**Given** a fresh clone of the repository  
**When** I run the documented bootstrap and compose commands  
**Then** `apps/web`, `apps/api`, and `postgres` start successfully with passing health checks  
**And** the repo structure and scripts align with the architecture baseline and starter-template requirement.
**And** rerunning the same bootstrap commands does not produce conflicting setup state (idempotent setup behavior).

### Story 1.2: Create Todo Persistence Schema and Migration Pipeline

As a user,  
I want todos to be stored durably with stable schema rules,  
So that my tasks remain available and consistent over time.

**FRs implemented:** FR11, FR12, FR13
**NFRs implemented:** NFR7, NFR8

**Acceptance Criteria:**

**Given** the API service starts with migrations enabled  
**When** migrations execute  
**Then** a `todos` table and required indexes are created with deterministic Postgrator ordering  
**And** successful writes survive normal API restarts.
**And** migration failures stop API readiness with a clear, actionable startup error.

### Story 1.3: Implement Create and List Todos API Contract

As a user,  
I want to add todos and retrieve my list,  
So that I can capture tasks and see them in one place.

**FRs implemented:** FR1, FR2, FR5, FR18
**NFRs implemented:** NFR5, NFR6

**Acceptance Criteria:**

**Given** the API is running  
**When** I send valid create and list requests to `/api/v1/todos`  
**Then** the API returns canonical success envelopes with `camelCase` fields and created timestamps  
**And** invalid payloads return safe, consistent error envelopes with request IDs.
**And** list responses are stably ordered by a documented default (e.g., `createdAt` descending).

### Story 1.4: Build Primary Capture and List Surface

As a user,  
I want to open the app and instantly capture and view tasks,  
So that I can complete the core flow without onboarding friction.

**FRs implemented:** FR1, FR2, FR5, FR7, FR8, FR16, FR18
**NFRs implemented:** NFR2, NFR9

**Acceptance Criteria:**

**Given** I load the app on first visit or return visit  
**When** the home screen renders  
**Then** I see a visible quick-capture input and todo list with loading/empty states  
**And** successful creates appear in the list with created-at metadata and persisted truth after refresh.
**And** empty submissions are blocked with inline validation while preserving current user input.

## Epic 2: Complete and Manage Tasks with Clarity

Enable users to complete/uncomplete and delete tasks with clear state distinction and honest persistence feedback.

### Story 2.1: Implement Complete/Uncomplete API and State Mapping

As a user,  
I want to mark tasks complete or active again,  
So that I can track my progress accurately.

**FRs implemented:** FR3, FR18
**NFRs implemented:** NFR1

**Acceptance Criteria:**

**Given** an existing todo  
**When** I submit a completion toggle request  
**Then** the API updates persisted completion state and returns consistent response envelopes  
**And** subsequent list reads reflect the same completion truth.
**And** toggling a non-existent id returns a deterministic client-safe error response.

### Story 2.2: Implement Delete Todo API with Safe Error Handling

As a user,  
I want to delete tasks I no longer need,  
So that my list stays focused and clean.

**FRs implemented:** FR4, FR9, FR18
**NFRs implemented:** NFR5, NFR6

**Acceptance Criteria:**

**Given** an existing or non-existing todo id  
**When** I call the delete endpoint  
**Then** the API removes existing items and returns predictable status semantics for missing items  
**And** errors remain safe and actionable without leaking internals.
**And** repeated delete calls for the same id do not corrupt system state (idempotent behavior).

### Story 2.3: Build Todo Row Interactions and Visual State Distinction

As a user,  
I want obvious controls and visual cues for active vs completed tasks,  
So that I can scan and manage work quickly.

**FRs implemented:** FR3, FR4, FR6, FR18
**NFRs implemented:** NFR1, NFR9

**Acceptance Criteria:**

**Given** a mixed list of active and completed todos  
**When** I toggle completion or delete an item from the UI  
**Then** row-level controls update immediately with clear active/completed styling differences  
**And** the resulting UI state reconciles to persisted server truth after mutation completion.
**And** if a mutation fails, the affected row shows explicit failure status instead of silently reverting.

## Epic 3: Handle Failures and Recovery Without Losing Trust

Enable users to understand loading/failure/offline states and recover with item-level retry without ambiguity about save status.

### Story 3.1: Establish Canonical Client Error and Status Handling

As a user,  
I want legible loading and error behavior,  
So that I always understand what the system is doing.

**FRs implemented:** FR8, FR9, FR10, FR18
**NFRs implemented:** NFR2, NFR3

**Acceptance Criteria:**

**Given** list fetches and mutations can succeed or fail  
**When** network/API responses are processed in the client  
**Then** the UI shows explicit loading and error states (never silent failure)  
**And** state handling avoids duplicate/chatty list requests in normal usage.
**And** retry/reload actions are visible to users and return the interface to a valid interactive state on success.

### Story 3.2: Implement Persistence Status Badge Lifecycle

As a user,  
I want to see whether each task is saving, saved, or not saved,  
So that I can trust the data shown on screen.

**FRs implemented:** FR9, FR10, FR18
**NFRs implemented:** NFR3, NFR9

**Acceptance Criteria:**

**Given** I trigger create/update actions  
**When** mutation state changes  
**Then** each affected row displays `Saving`, `Saved`, or `Not saved` text with semantic visuals  
**And** the UI never implies persistence success before server confirmation.
**And** status labels remain visible long enough to be perceivable and testable in automated and manual QA.

### Story 3.3: Add Inline Retry for Failed Item Persistence

As a user,  
I want to retry failed saves directly where they failed,  
So that I can recover quickly without losing context.

**FRs implemented:** FR10, FR18
**NFRs implemented:** NFR3

**Acceptance Criteria:**

**Given** a todo row is in `Not saved` state  
**When** I select retry  
**Then** only that item mutation is retried and transitions to `Saved` on success  
**And** repeated failure preserves the item with clear actionable guidance.
**And** retry operations are disabled while in-flight to prevent duplicate write submissions.

### Story 3.4: Add Offline Read-Only Banner and Write Safeguards

As a user,  
I want clear offline/read-only communication,  
So that I know when changes cannot be persisted.

**FRs implemented:** FR9, FR10, FR18
**NFRs implemented:** NFR5, NFR9

**Acceptance Criteria:**

**Given** connectivity loss or API unavailability for writes  
**When** the app detects offline/read-only mode  
**Then** a persistent non-alarming offline banner appears with recovery guidance  
**And** write interactions are clearly disabled or guarded while preserving visible user data.
**And** write controls are automatically re-enabled when connectivity is restored and readiness checks pass.

## Epic 4: Deliver Cross-Device Accessible Experience

Enable complete and accessible task management across mobile and desktop with keyboard and assistive-technology support.

### Story 4.1: Implement Responsive Layout and Touch-Ready Controls

As a mobile and desktop user,  
I want the same core flow to work across viewport sizes,  
So that I can manage tasks consistently on any device.

**FRs implemented:** FR14, FR15
**NFRs implemented:** NFR1, NFR9

**Acceptance Criteria:**

**Given** mobile, tablet, and desktop viewport widths  
**When** I run the core flow (add, list, complete, delete, retry)  
**Then** the layout adapts without horizontal scroll and maintains clear information hierarchy  
**And** interactive targets remain touch-friendly on mobile.
**And** metadata and status text remain readable without overlap or truncation that hides critical state.

### Story 4.2: Deliver Keyboard-Only Core Flow

As a keyboard user,  
I want to execute all core todo actions without a mouse,  
So that I can use the app efficiently and accessibly.

**FRs implemented:** FR19
**NFRs implemented:** NFR10

**Acceptance Criteria:**

**Given** I only use keyboard input  
**When** I navigate through capture, list, complete, delete, and retry actions  
**Then** focus order remains logical with visible focus indicators and no traps  
**And** I can complete the full core workflow end-to-end.
**And** keyboard interactions are equivalent on primary supported desktop browsers.

### Story 4.3: Ensure Semantic Accessibility and Non-Color Status Cues

As a screen-reader or low-vision user,  
I want controls and statuses to be semantically clear,  
So that I can understand and operate the interface reliably.

**FRs implemented:** FR20
**NFRs implemented:** NFR9

**Acceptance Criteria:**

**Given** assistive technology is active  
**When** I interact with task controls and status indicators  
**Then** interactive elements expose accessible names/roles and status messaging is announced appropriately  
**And** critical states are communicated with text/icon cues, not color alone.
**And** icon-only controls include explicit accessible labels with no empty-name violations.

### Story 4.4: Validate Accessibility and Responsive Quality Gates

As a product team,  
I want automated and manual checks for UX quality constraints,  
So that regressions are caught before release.

**FRs implemented:** FR14, FR15, FR19, FR20
**NFRs implemented:** NFR9, NFR10

**Acceptance Criteria:**

**Given** CI and local test workflows  
**When** accessibility and responsive checks run (including e2e coverage)  
**Then** core journeys pass defined quality gates for viewport behavior and a11y baselines  
**And** any known gaps are documented with remediation targets before release.
**And** failing quality gates block release promotion until issues are fixed or explicitly waived with rationale.

## Epic 5: Quality and Performance Assurance

Establish a robust quality gate by implementing comprehensive E2E tests and performance scenarios that validate functional correctness and NFR compliance.

### Story 5.1: Implement Core Journey E2E Test Suite

As a developer,
I want automated Playwright tests covering the full todo lifecycle (create, list, complete, delete, recovery),
So that I can prevent functional regressions across all supported viewports.

**FRs implemented:** FR21

**Acceptance Criteria:**

**Given** a running local environment (Web, API, DB)
**When** I run the Playwright test suite
**Then** at least 5 distinct test scenarios pass covering:
  1. Quick capture and list visibility.
  2. Toggle completion and visual state change.
  3. Item deletion and list reconciliation.
  4. Inline retry after simulated API failure.
  5. Layout responsiveness (mobile vs desktop).
**And** tests run successfully in the CI pipeline quality gate.

### Story 5.2: Configure k6 Performance Validation Suite

As an operator,
I want automated k6 load tests that measure API latency and throughput,
So that I can verify compliance with NFR1 and NFR2 performance targets.

**FRs implemented:** FR22
**NFRs implemented:** NFR1, NFR2

**Acceptance Criteria:**

**Given** a production-like or local test environment
**When** I execute the k6 load scenarios (Read/Write)
**Then** the p95 latency for CRUD operations remains under 500ms (NFR1).
**And** initial load of 500 items completes within 2s at p95 (NFR2).
**And** the test results are exported as a structured report for baseline comparison.

### Story 5.3: Establish Coverage Reporting and 70% Quality Gate

As a maintainer,
I want centralized coverage reporting for Vitest unit/integration tests,
So that I can enforce a 70% coverage floor and identify untested logic.

**NFRs implemented:** NFR11

**Acceptance Criteria:**

**Given** the monorepo test runners
**When** I run `pnpm test:coverage`
**Then** a combined coverage report is generated for `apps/web` and `apps/api`.
**And** the build fails if total line/branch coverage falls below 70% (NFR11).
**And** the report is accessible as a CI artifact for developer review.

### Story 5.4: Harden CI pipelines and resolve type debt

**Status: done**

As a maintainer,  
I want the CI pipeline to be green and free of lint/type errors,  
So that I can trust the build and deployment process.

**Acceptance Criteria:**

**Given** the current state of the codebase  
**When** I run the CI pipeline (lint, typecheck, build, test)  
**Then** all jobs pass without errors or warnings  
**And** any remaining "any" types or implicit any errors in tests are resolved  
**And** the CI configuration is verified for accuracy.

