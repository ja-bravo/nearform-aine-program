# Data Models - API Service (api)

## Overview
The application uses PostgreSQL as its primary data store.

## Database Schema

### `todos` table
- `id`: UUID (Primary Key)
- `title`: VARCHAR(255)
- `completed`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Migrations
Migrations are managed in `apps/api/migrations/`.

- **001.do.create-todos.sql**: Creates the `todos` table.
- **002.do.add-todos-indexes.sql**: Adds performance indexes to the `todos` table.

## Migration Strategy
Migrations are executed at startup or via the `pnpm migrate` command. The `postgrator` library is used to manage schema versions.
