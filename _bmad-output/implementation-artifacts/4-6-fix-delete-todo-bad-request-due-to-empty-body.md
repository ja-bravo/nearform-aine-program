# Story 4.6: Fix Delete Todo Bad Request due to Empty Body

Status: done

<!-- Note: This story is created by the BMad Method story-creation workflow to address a reported 400 error on DELETE. -->

## Story

As a **developer**,  
I want **the client to only send the Content-Type header when a request has a body**,  
so that **the server does not reject empty-body DELETE requests with a 400 Bad Request error**.

## Acceptance Criteria

1. **[AC1] Conditional Content-Type Header**  
   - `fetchJson` on the client must only include `Content-Type: application/json` if the request has a `body`.
2. **[AC2] Successful DELETE without 400**  
   - `DELETE` requests (which typically have no body) should reach the API without being rejected by the body parser.
3. **[AC3] End-to-End Delete Success**  
   - From the web application, deleting a todo should no longer result in a `400 Bad Request` in the console.

## Tasks / Subtasks

- [x] **T1 — Modify Client `fetchJson`** (AC1)
  - [x] Update `apps/web/src/shared/api/fetch-json.ts` to check `Boolean(init.body)` before adding the `Content-Type` header.
- [x] **T2 — Verify with Server Test** (AC2)
  - [x] Add a test case to `apps/api/src/server.test.ts` to ensure `DELETE` without `Content-Type` doesn't return `400`.
- [x] **T3 — Confirm Success** (AC3)
  - [x] Verified that tests pass and the logic handles empty bodies correctly.

## Developer Guardrails

- **Architecture Compliance:**
  - Client-Server Contract: Maintain `application/json` as the standard for requests with bodies.
- **Testing Standards:**
  - Ensure that `POST` and `PATCH` (which have bodies) still work correctly by checking their tests.

## Previous Story Intelligence (Epic 4.5)

- **Learnings:**
  - Fastify's body parser (and our custom error handler) throws `FST_ERR_CTP_EMPTY_JSON_BODY` if the `Content-Type` is set but the body is missing.

## Git Intelligence Summary

- `apps/web/src/shared/api/fetch-json.ts` was modified to conditionally add the header.

## Project Context Reference

- `apps/web/src/shared/api/fetch-json.ts`
- `apps/api/src/server.ts`

## Web Intelligence

- **Fastify & Empty JSON Body:** It is a known behavior where setting the `Content-Type` triggers the body parser, which then expects a valid JSON body (not empty).

## Dev Agent Record (Implementation ONLY)

### Implementation Plan
1. Update `apps/web/src/shared/api/fetch-json.ts` to only include `Content-Type: application/json` if `init.body` is present.
2. Update `apps/api/src/server.test.ts` with a test case ensuring `DELETE` doesn't return `400` when no body/header is present.

### Change Log
- **2026-04-03**: Created and implemented fix for `DELETE` 400 error.

### File List
- `apps/web/src/shared/api/fetch-json.ts`
- `apps/api/src/server.test.ts`

### Completion Notes
The issue was caused by the client always sending `Content-Type: application/json` for every request, even those without a body (like `DELETE`). This triggered the Fastify body parser, which rejected the empty body with a `400 Bad Request`. Conditional header logic has been added to `fetchJson`.

### Review Findings
(To be filled by code-review agent)
