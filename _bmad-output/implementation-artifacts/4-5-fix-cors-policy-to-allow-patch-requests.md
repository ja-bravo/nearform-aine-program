# Story 4.5: Fix CORS Policy to Allow PATCH Requests

Status: done

<!-- Note: This story is created by the BMad Method story-creation workflow to address a reported CORS issue. -->

## Story

As a **developer**,  
I want **the API to allow PATCH requests from the web application**,  
so that **todo updates can be performed successfully without preflight or method errors**.

## Acceptance Criteria

1. **[AC1] PATCH method in CORS headers**  
   - The API's CORS configuration must explicitly include `PATCH` in the `Access-Control-Allow-Methods` header for allowed origins.
2. **[AC2] Successful Preflight Responses**  
   - `OPTIONS` preflight requests for `PATCH` operations must return a `204 No Content` or `200 OK` with the correct CORS headers.
3. **[AC3] End-to-End PATCH Success**  
   - From the web application (`localhost:3000`), a `PATCH` request to the API (`localhost:3001`) must succeed without CORS errors.
4. **[AC4] Environment Consistency**  
   - CORS settings must be derived from environment variables (`CORS_ORIGIN`) while maintaining local development support.

## Tasks / Subtasks

- [x] **T1 — Update API CORS Configuration** (AC1, AC4)
  - [x] Modify `apps/api/src/server.ts` to explicitly allow `PATCH` in the `@fastify/cors` registration.
  - [x] Ensure `methods` includes `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- [x] **T2 — Verify Preflight Response** (AC2)
  - [x] Use `curl` or a browser to verify that an `OPTIONS` request to a todo endpoint returns the correct `Access-Control-Allow-Methods`.
- [x] **T3 — Validate with Web Integration** (AC3)
  - [x] Run both `web` and `api` apps.
  - [x] Perform a completion toggle (which uses `PATCH`) and verify no CORS errors in the browser console.

## Developer Guardrails

- **Architecture Compliance:**
  - Security: Maintain the CORS allowlist approach from `NFR6`.
  - Library: Use `@fastify/cors` options correctly.
- **Testing Standards:**
  - Verify with a manual preflight check: `curl -v -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: PATCH" http://localhost:3001/api/v1/todos/ANY_ID`.

## Previous Story Intelligence (Epic 4.2)

- **Learnings:**
  - The project uses `http://localhost:3000` for the web app and `http://localhost:3001` for the API.
  - Recent work on keyboard navigation involved `PATCH` requests for toggling completion, which likely triggered this discovery.

## Git Intelligence Summary

- The current `apps/api/src/server.ts` uses `await app.register(cors, { origin: parseCorsOrigins() });`.

## Project Context Reference

- `apps/api/src/server.ts` (CORS configuration)
- `apps/api/src/features/todos/todo-routes.ts` (Endpoint definitions)

## Web Intelligence

- **Fastify CORS:** By default, if `methods` is not specified, it allows common methods but sometimes `PATCH` is excluded depending on the version or specific configuration. Explicitly listing them is safer.

## Dev Agent Record (Implementation ONLY)

### Implementation Plan
1. Update `apps/api/src/server.ts` to include `methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']` in the CORS configuration.
2. Verify the fix using `curl` to simulate a preflight request.
3. Verify with the browser to ensure the `PATCH` request for todo completion works as expected.

### Change Log
- **2026-04-03**: Created story to fix CORS PATCH issue.
- **2026-04-03**: Implemented fix in `apps/api/src/server.ts` and added verification test.

### File List
- `apps/api/src/server.ts`
- `apps/api/src/server.test.ts`

### Completion Notes
The CORS issue has been resolved by explicitly allowing the `PATCH` method in the `@fastify/cors` configuration. A new test case has been added to `apps/api/src/server.test.ts` to ensure that preflight `OPTIONS` requests for `PATCH` operations return the correct `Access-Control-Allow-Methods` header. All server tests passed.

### Review Findings
(To be filled by code-review agent)
