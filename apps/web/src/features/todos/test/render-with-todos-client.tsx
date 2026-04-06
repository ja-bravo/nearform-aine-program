import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { TodosSyncProvider } from "@/features/todos/components/todos-sync-context";
import type { TodoDto } from "@/shared/api/schemas";

export function renderWithTodosClient(
  ui: ReactNode,
  initialTodos: TodoDto[] = [],
  options?: Omit<RenderOptions, "wrapper">
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <TodosSyncProvider initialTodos={initialTodos}>{ui}</TodosSyncProvider>
    </QueryClientProvider>,
    options
  );
}
