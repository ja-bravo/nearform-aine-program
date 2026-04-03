"use client";

import { FC, ReactNode } from "react";
import { ApiError } from "@/shared/api/api-error";
import type { TodoDto } from "@/shared/api/schemas";
import { useCompleteTodoMutation } from "@/features/todos/hooks/use-complete-todo-mutation";
import { useDeleteTodoMutation } from "@/features/todos/hooks/use-delete-todo-mutation";
import { usePersistenceStatus } from "@/features/todos/hooks/use-persistence-status";
import {
  PersistenceStatusBadge,
  type PersistenceStatus,
} from "./persistence-status-badge";

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return createdAtFormatter.format(date);
  } catch {
    return "Invalid date";
  }
}

type TodoItemRowProps = {
  todo: TodoDto;
};

export function TodoItemRow({ todo }: TodoItemRowProps) {
  const completeMutation = useCompleteTodoMutation();
  const deleteMutation = useDeleteTodoMutation();

  const isPending = completeMutation.isPending || deleteMutation.isPending;

  const persistenceStatus = usePersistenceStatus({
    isSuccess: completeMutation.isSuccess || deleteMutation.isSuccess,
    isError: completeMutation.isError || deleteMutation.isError,
    isPending,
  });

  const completeError =
    completeMutation.error instanceof ApiError
      ? completeMutation.error.message
      : completeMutation.error
        ? "Failed to update"
        : null;

  const deleteError =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? "Failed to delete"
        : null;

  const handleRetryToggle = () => {
    completeMutation.reset();
    completeMutation.mutate({
      id: todo.id,
      isCompleted: !todo.isCompleted,
    });
  };

  const handleRetryDelete = () => {
    deleteMutation.reset();
    deleteMutation.mutate(todo.id);
  };

  const inlineError = completeError ?? deleteError;
  const showBothErrors = completeError && deleteError;

  return (
    <li className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <input
        type="checkbox"
        checked={todo.isCompleted}
        disabled={isPending}
        onChange={() => {
          completeMutation.reset();
          deleteMutation.reset();
          completeMutation.mutate({
            id: todo.id,
            isCompleted: !todo.isCompleted,
          });
        }}
        className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 disabled:opacity-60 dark:border-zinc-600"
        aria-label={`Mark '${todo.description || "task"}' as ${todo.isCompleted ? "active" : "complete"}`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            todo.isCompleted
              ? "text-zinc-400 line-through dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {todo.description}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Added {formatCreatedAt(todo.createdAt)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <PersistenceStatusBadge status={persistenceStatus} />
          {inlineError && (
            <div
              role="alert"
              className="flex flex-col gap-1 text-xs text-red-600 dark:text-red-400"
            >
              {showBothErrors ? (
                <>
                  <div className="flex items-center gap-2">
                    <p>{completeError}</p>
                    <button
                      onClick={handleRetryToggle}
                      className="font-medium underline hover:text-red-700 dark:hover:text-red-300"
                    >
                      Retry update
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>{deleteError}</p>
                    <button
                      onClick={handleRetryDelete}
                      className="font-medium underline hover:text-red-700 dark:hover:text-red-300"
                    >
                      Retry delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <p>{inlineError}</p>
                  <button
                    onClick={
                      completeError ? handleRetryToggle : handleRetryDelete
                    }
                    className="font-medium underline hover:text-red-700 dark:hover:text-red-300"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          completeMutation.reset();
          deleteMutation.reset();
          deleteMutation.mutate(todo.id);
        }}
        aria-label={`Delete '${todo.description || "task"}'`}
        className="shrink-0 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        {deleteMutation.isPending ? "Deleting…" : "Delete"}
      </button>
    </li>
  );
}
