# API Contracts - API Service (api)

## Overview
The API service exposes a REST interface for managing Todos.

## Endpoints

### Todos Feature
- **GET /todos**: Retrieve a list of todos.
- **POST /todos**: Create a new todo.
- **PATCH /todos/:id**: Update an existing todo.
- **DELETE /todos/:id**: Delete a todo.

## Request/Response Schemas
All endpoints use Zod for validation. Schemas are defined in `apps/api/src/features/todos/todo-schemas.ts`.

## Error Handling
Standard error responses follow the error envelope format:
```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Authentication
Currently, no authentication is implemented (open for internal use/demo).
