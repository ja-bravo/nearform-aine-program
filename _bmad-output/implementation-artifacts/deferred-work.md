# Deferred Work

## Deferred from: code review of 2-2-implement-delete-todo-api-with-safe-error-handling (2026-04-02)

- Performance tests use in-process mocks across the full test suite — they measure Fastify framework overhead only, not real DB/network latency. A dedicated performance/load testing layer (e.g., k6, autocannon) is needed to validate NFR1 p95 targets meaningfully.
- No Fastify response schema declared on DELETE (or PATCH/POST) routes — 204 Content-Type header behaviour is implementation-defined. Consider adding Fastify route schemas for all routes to enable proper serialization, OpenAPI generation, and predictable header handling.
- No integration test for persistence confirmation (AC2) — verifying a deleted item is absent from a subsequent GET requires a real database and is not covered by the current mock-based unit test suite. Consider adding an integration test layer (e.g., Testcontainers or a dedicated test database).

## Deferred from: code review of 2-3-build-todo-row-interactions-and-visual-state-distinction (2026-04-02)

- Missing delete confirmation dialog [todo-item-row.tsx] — deferred, pre-existing (UX enhancement)
- Error handling visibility (notification system) [todo-item-row.tsx] — deferred, pre-existing (architectural preference)
