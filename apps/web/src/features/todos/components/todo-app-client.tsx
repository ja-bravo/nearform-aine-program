"use client";

import type { TodoDto } from "@/shared/api/schemas";
import { TodoHomeContent } from "@/features/todos/components/todo-home-content";
import { TodosSyncProvider } from "@/features/todos/components/todos-sync-context";

type TodoAppClientProps = {
  initialTodos: TodoDto[];
  configBlocked: boolean;
  initialLoadError?: { message: string; requestId?: string };
};

export function TodoAppClient({
  initialTodos,
  configBlocked,
  initialLoadError,
}: TodoAppClientProps) {
  return (
    <TodosSyncProvider initialTodos={initialTodos}>
      <TodoHomeContent
        configBlocked={configBlocked}
        initialLoadError={initialLoadError}
      />
    </TodosSyncProvider>
  );
}
