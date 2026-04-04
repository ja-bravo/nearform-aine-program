"use client";

import { QuickCaptureBar } from "@/features/todos/components/quick-capture-bar";
import { TodoList } from "@/features/todos/components/todo-list";

export function TodoHome() {
  const base = getApiBaseUrl();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useTodosQuery();

  const configMessage = !base
    ? "App is missing API configuration. Set NEXT_PUBLIC_API_BASE_URL."
    : null;

  const errorMessage =
    isError && error instanceof ApiError
      ? error.message
      : isError
        ? "Could not load tasks. Try again."
        : undefined;

  const requestId =
    isError && error instanceof ApiError ? error.requestId : undefined;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <header className="px-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tasks
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Capture quickly; your list comes from the server.
        </p>
      </header>
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
            todos={data?.data?.todos ?? []}
            isLoading={isLoading}
            loadFailed={isError}
            errorMessage={errorMessage}
            requestId={requestId}
            onRetry={() => {
              void refetch().catch(() => {});
            }}
            isRetrying={isFetching}
          />
        )}
      </section>
    </div>
  );
}
