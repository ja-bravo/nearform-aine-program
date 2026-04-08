# API Contracts — API Service

All endpoints are registered under the prefix `/api/v1/todos`.

## Response Envelope

Every response follows a consistent envelope structure:

**Success:**
```json
{
  "data": { ... },
  "meta": { "requestId": "uuid" }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR | REQUEST_ERROR",
    "message": "Human-readable message",
    "requestId": "uuid",
    "details": { ... }
  }
}
```

Internal server errors (500) always return `"An unexpected error occurred"` — no stack traces leak to clients.

---

## Endpoints

### POST /api/v1/todos

Create a new todo.

**Request Body:**
```json
{
  "description": "string (1–10,000 chars, trimmed)"
}
```

**Validation:** `createTodoBodySchema` — `description` is required, trimmed, min 1, max 10,000 characters.

**Success Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "description": "string",
    "isCompleted": false,
    "createdAt": "ISO 8601 datetime"
  },
  "meta": { "requestId": "uuid" }
}
```

**Error Responses:**
- `400` — `VALIDATION_ERROR` with Zod flatten details

---

### GET /api/v1/todos

List all todos, ordered by `created_at` descending (newest first).

**Success Response (200):**
```json
{
  "data": {
    "todos": [
      {
        "id": "uuid",
        "description": "string",
        "isCompleted": false,
        "createdAt": "ISO 8601 datetime"
      }
    ]
  },
  "meta": { "requestId": "uuid" }
}
```

---

### PATCH /api/v1/todos/:id

Toggle a todo's completion status.

**Path Parameters:**
- `id` — UUID (validated by `paramIdSchema`)

**Request Body:**
```json
{
  "isCompleted": true
}
```

**Validation:** `updateTodoBodySchema` — `isCompleted` is a required boolean.

**Success Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "description": "string",
    "isCompleted": true,
    "createdAt": "ISO 8601 datetime"
  },
  "meta": { "requestId": "uuid" }
}
```

**Error Responses:**
- `400` — `VALIDATION_ERROR` (invalid UUID or body)
- `404` — `NOT_FOUND` (todo does not exist)

---

### DELETE /api/v1/todos/:id

Delete a todo permanently.

**Path Parameters:**
- `id` — UUID (validated by `paramIdSchema`)

**Success Response:** `204 No Content`

**Error Responses:**
- `400` — `VALIDATION_ERROR` (invalid UUID format)
- `404` — `NOT_FOUND` (todo does not exist)

---

## Health Checks

| Endpoint | Purpose | Dependencies |
|----------|---------|--------------|
| `GET /healthz/live` | Liveness probe — server is running | None |
| `GET /healthz/ready` | Readiness probe — database is reachable | PostgreSQL (`SELECT 1`) |

Both return `{ "status": "ok" }` on success.  
`/healthz/ready` returns `503` with error envelope if `DATABASE_URL` is missing or the database is unreachable.

---

## Shared Schemas

All request/response validation uses Zod 4 schemas defined in `apps/api/src/features/todos/todo-schemas.ts`:

| Schema | Purpose |
|--------|---------|
| `createTodoBodySchema` | Validates POST body |
| `updateTodoBodySchema` | Validates PATCH body |
| `paramIdSchema` | Validates UUID path parameter |
| `todoDtoSchema` | Validates outbound DTO shape |
| `createTodoSuccessSchema` | Validates full POST/PATCH success envelope |
| `listTodosSuccessSchema` | Validates full GET success envelope |
| `errorEnvelopeSchema` | Validates error response shape |

## CORS

Configured via `CORS_ORIGIN` environment variable (comma-separated origins). Defaults to `http://localhost:3000`.
Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
