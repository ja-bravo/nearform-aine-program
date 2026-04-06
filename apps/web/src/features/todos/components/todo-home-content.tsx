"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { QuickCaptureBar } from "@/features/todos/components/quick-capture-bar";
import { TodoList } from "@/features/todos/components/todo-list";
import { useTodosSync } from "@/features/todos/components/todos-sync-context";

type TodoHomeContentProps = {
  configBlocked: boolean;
  initialLoadError?: { message: string; requestId?: string };
};

export function TodoHomeContent({
  configBlocked,
  initialLoadError,
}: TodoHomeContentProps) {
  const { todos } = useTodosSync();
  const router = useRouter();
  const [isRefreshPending, startTransition] = useTransition();

  const configMessage = configBlocked
    ? "App is missing API configuration. Set NEXT_PUBLIC_API_BASE_URL."
    : null;

  const handleListRetry = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <QuickCaptureBar />
      {configMessage && (
        <div
          role="alert"
          className="mx-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
        >
          {configMessage}
        </div>
      )}
      <section aria-labelledby="todo-list-heading">
        <h2 id="todo-list-heading" className="sr-only">
          Your tasks
        </h2>
        {configMessage ? (
          <p
            className="p-2 text-sm text-zinc-600 dark:text-zinc-400"
            role="status"
          >
            Connect the API to load your tasks.
          </p>
        ) : (
          <TodoList
            todos={todos}
            loadFailed={Boolean(initialLoadError)}
            errorMessage={initialLoadError?.message}
            requestId={initialLoadError?.requestId}
            onRetry={initialLoadError ? handleListRetry : undefined}
            isRetrying={isRefreshPending}
          />
        )}
      </section>
    </>
  );
}
