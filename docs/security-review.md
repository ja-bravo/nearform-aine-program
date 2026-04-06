# Security review (AI-assisted)

**Scope:** Application code under `apps/api`, `apps/web`, and `packages/ui` used by this product. BMAD skill copies, Lighthouse artifacts, and perf scripts were excluded.  
**Date:** 2026-04-06  
**Method:** Static pattern review (XSS, injection, SSRF, auth, headers, dependency audit) against the current tree.

## Summary

| Severity | Count |
|----------|-------|
| High     | 0     |
| Medium   | 2     |
| Low      | 2     |
| Info     | 2     |

The API uses parameterized SQL (`@nearform/sql`), route inputs are validated with Zod (including UUID path params and bounded todo descriptions), and the web UI renders user content through React text nodes (no `dangerouslySetInnerHTML` in app code). `pnpm audit` reported no known vulnerable dependencies at review time.

---

## Medium

### M1 — No authentication or authorization on the todo API

**Finding:** `registerTodosRoutes` exposes list/create/update/delete to any caller that can reach the service. There are no API keys, sessions, or per-user scoping; all todos are globally shared.

**Risk:** Unauthorized read/write/delete of all tasks; no accountability or tenant isolation.

**Remediation:**

- Add authentication (e.g. session/JWT/OAuth) appropriate to your threat model.
- Scope queries by `user_id` or tenant and enforce ownership on PATCH/DELETE.
- For internal-only services, use network policies (private VPC, mTLS, or API gateway with auth).

**References:** `apps/api/src/features/todos/todo-routes.ts`, `apps/api/src/server.ts`

---

### M2 — No abuse controls on public HTTP API

**Finding:** Fastify server registers CORS and routes but no rate limiting, request size limits beyond defaults, or bot mitigation.

**Risk:** Easier DoS or brute-force style abuse against read/write endpoints.

**Remediation:**

- Add `@fastify/rate-limit` (per IP and optionally per API key/user).
- Confirm/tune body size limits for JSON payloads.
- Put the API behind a reverse proxy or edge (CDN/WAF) with rate limits in production.

**References:** `apps/api/src/server.ts`

---

## Low

### L1 — Security headers (baseline in place; tune over time)

**Finding (historical):** Headers were missing; they are now set in `apps/web/next.config.ts` for all routes: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and a Content-Security-Policy with `connect-src` including `NEXT_PUBLIC_API_BASE_URL` when set.

**Residual risk:** CSP uses `script-src` / `style-src` allowances typical for Next.js without nonces; tighten with [middleware nonces](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy) when you want stricter policy. HSTS remains best applied at the CDN / edge for HTTPS deployments.

**References:** `apps/web/next.config.ts`

---

### L2 — Validation error details exposed to clients

**Finding:** Failed body validation returns `flattenError(parsed.error)` in the error envelope `details` field.

**Risk:** Assists automated probing of expected shapes and field names (useful to attackers mapping the API). Usually acceptable for partner/internal APIs; tighter for fully public surfaces.

**Remediation:**

- In production, return generic messages and log detailed validation server-side only, or
- Return a stable error code plus minimal field identifiers without full Zod trees.

**References:** `apps/api/src/features/todos/todo-routes.ts`, `apps/api/src/shared/http/error-envelope.ts`

---

### L3 — Global error handler returns raw messages for non-500 errors

**Finding:** `createServer` error handler uses `toErrorBody(statusCode, err.message, ...)`. For `statusCode` &lt; 500, `err.message` is sent to the client. Custom errors with assigned `statusCode` could leak internal wording if not curated.

**Risk:** Information disclosure if future code throws errors with sensitive detail and sets `statusCode` to 4xx.

**Remediation:** Map known error types to stable, public messages; log full details server-side only.

**References:** `apps/api/src/server.ts`, `apps/api/src/shared/http/error-envelope.ts`

---

## Informational

### I1 — CORS allowlist via environment

**Observation:** `CORS_ORIGIN` is parsed as a comma-separated allowlist; default `http://localhost:3000`. Appropriate pattern for browser clients.

**Remediation:** Ensure production sets explicit origins (no unintended `*` via misconfiguration). `apps/api/src/server.ts`

---

### I2 — React rendering and live region text

**Observation:** Todo descriptions and API error strings are rendered as React children or plain text in the a11y announcer (`apps/web/src/shared/ui/a11y-announcer.tsx`). Default React escaping applies; no HTML injection path found in reviewed UI.

**Remediation:** Keep avoiding `dangerouslySetInnerHTML` and raw `innerHTML` for user-controlled strings.

---

## Checks performed

| Area              | Result |
|-------------------|--------|
| SQL injection     | Parameterized queries via `@nearform/sql` in `todo-repository.ts` |
| Command injection | No `child_process` usage in `apps/*` |
| XSS (app code)    | No `dangerouslySetInnerHTML` / `eval` in apps |
| SSRF (web→API)    | Base URL from env; paths from code, IDs URL-encoded |
| Dependencies      | `pnpm audit`: no known vulnerabilities (2026-04-06) |

---

## Suggested next steps

1. Decide product stance on **auth** and **rate limiting** before a public launch.
2. Tighten **CSP** with nonces in middleware if you need stricter `script-src` / `style-src`.
3. Re-run **`pnpm audit`** in CI on a schedule and on lockfile changes.
