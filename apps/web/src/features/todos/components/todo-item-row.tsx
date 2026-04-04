"use client";

import { useState, useRef } from "react";
import { ApiError } from "@/shared/api/api-error";
import type { TodoDto } from "@/shared/api/schemas";
import { useCompleteTodoMutation } from "@/features/todos/hooks/use-complete-todo-mutation";
import { useDeleteTodoMutation } from "@/features/todos/hooks/use-delete-todo-mutation";
import { usePersistenceStatus } from "@/features/todos/hooks/use-persistence-status";
import { useConnectivity } from "@/shared/hooks/use-connectivity";
import { PersistenceStatusBadge } from "./persistence-status-badge";
import { announce } from "@/shared/ui/a11y-announcer";

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

const ERROR_UPDATE_FALLBACK = "Failed to update";
const ERROR_DELETE_FALLBACK = "Failed to delete";
const QUICK_CAPTURE_INPUT_ID = "quick-capture-description";

export function TodoItemRow({ todo }: TodoItemRowProps) {
  const completeMutation = useCompleteTodoMutation();
  const deleteMutation = useDeleteTodoMutation();
  const { isReadOnly } = useConnectivity();
  const liRef = useRef<HTMLLIElement>(null);

  const [lastCompleteError, setLastCompleteError] = useState<string | null>(
    null
  );
  const [lastDeleteError, setLastDeleteError] = useState<string | null>(null);

  const isPending = completeMutation.isPending || deleteMutation.isPending;
  const isInteractionDisabled = isPending || isReadOnly;

  const persistenceStatus = usePersistenceStatus({
    isSuccess: completeMutation.isSuccess || deleteMutation.isSuccess,
    isError: completeMutation.isError || deleteMutation.isError,
    isPending,
  });

  const handleToggle = () => {
    if (isInteractionDisabled) return;
    completeMutation.reset();
    completeMutation.mutate(
      {
        id: todo.id,
        isCompleted: !todo.isCompleted,
      },
      {
        onSuccess: () => {
          setLastCompleteError(null);
          announce(
            `Task '${todo.description}' marked as ${!todo.isCompleted ? "complete" : "active"}`
          );
        },
        onError: (error) => {
          const msg =
            error instanceof ApiError ? error.message : ERROR_UPDATE_FALLBACK;
          setLastCompleteError(msg);
          announce(`Update failed: ${msg}`);
        },
      }
    );
  };

  const handleRetryToggle = () => {
    handleToggle();
  };

  const handleRetryDelete = () => {
    deleteMutation.mutate(todo.id, {
      onSuccess: () => {
        setLastDeleteError(null);
        announce(`Task '${todo.description}' deleted`);
        // AC5: Focus the next or previous item's checkbox after deletion
        const nextItem =
          liRef.current?.nextElementSibling ||
          liRef.current?.previousElementSibling;
        const target =
          nextItem?.querySelector('input[type="checkbox"]') ||
          document.getElementById(QUICK_CAPTURE_INPUT_ID);

        if (target instanceof HTMLElement) {
          target.focus();
        }
      },
      onError: (error) => {
        const msg =
          error instanceof ApiError ? error.message : ERROR_DELETE_FALLBACK;
        setLastDeleteError(msg);
        announce(`Delete failed: ${msg}`);
      },
    });
  };

  const inlineError = lastCompleteError ?? lastDeleteError;
  const showBothErrors = !!(lastCompleteError && lastDeleteError);

  const completeErrorId = `error-complete-${todo.id}`;
  const deleteErrorId = `error-delete-${todo.id}`;

  return (
    <li
      ref={liRef}
      data-testid="todo-item-row"
      className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <div className="flex shrink-0 items-center justify-center p-2 -m-2">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          disabled={isInteractionDisabled}
          onChange={handleToggle}
          className="h-6 w-6 shrink-0 cursor-pointer rounded border-zinc-300 text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:focus-visible:ring-zinc-400"
          aria-label={
            todo.isCompleted
              ? `Mark task active: ${todo.description}`
              : `Complete task: ${todo.description}`
          }
          aria-describedby={lastCompleteError ? completeErrorId : undefined}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`break-all text-sm font-medium ${
            todo.isCompleted
              ? "text-zinc-500 line-through dark:text-zinc-500"
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
                    <p id={completeErrorId}>{lastCompleteError}</p>
                    <button
                      onClick={handleRetryToggle}
                      disabled={completeMutation.isPending || isReadOnly}
                      className="rounded font-medium underline hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:no-underline disabled:opacity-60 dark:hover:text-red-300 dark:focus-visible:ring-red-400"
                    >
                      {completeMutation.isPending
                        ? "Retrying…"
                        : "Retry update"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p id={deleteErrorId}>{lastDeleteError}</p>
                    <button
                      onClick={handleRetryDelete}
                      disabled={deleteMutation.isPending || isReadOnly}
                      className="rounded font-medium underline hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:no-underline disabled:opacity-60 dark:hover:text-red-300 dark:focus-visible:ring-red-400"
                    >
                      {deleteMutation.isPending ? "Retrying…" : "Retry delete"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <p id={lastCompleteError ? completeErrorId : deleteErrorId}>
                    {inlineError}
                  </p>
                  <button
                    onClick={
                      lastCompleteError ? handleRetryToggle : handleRetryDelete
                    }
                    disabled={
                      (lastCompleteError
                        ? completeMutation.isPending
                        : deleteMutation.isPending) || isReadOnly
                    }
                    className="rounded font-medium underline hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:no-underline disabled:opacity-60 dark:hover:text-red-300 dark:focus-visible:ring-red-400"
                  >
                    {completeMutation.isPending || deleteMutation.isPending
                      ? "Retrying…"
                      : "Retry"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={isInteractionDisabled}
        onClick={() => {
          deleteMutation.reset();
          deleteMutation.mutate(todo.id, {
            onSuccess: () => {
              setLastDeleteError(null);
              announce(`Task '${todo.description}' deleted`);
              // AC5: Focus the next or previous item's checkbox after deletion
              const nextItem =
                liRef.current?.nextElementSibling ||
                liRef.current?.previousElementSibling;
              const target =
                nextItem?.querySelector('input[type="checkbox"]') ||
                document.getElementById(QUICK_CAPTURE_INPUT_ID);

              if (target instanceof HTMLElement) {
                target.focus();
              }
            },
            onError: (error) => {
              const msg =
                error instanceof ApiError
                  ? error.message
                  : ERROR_DELETE_FALLBACK;
              setLastDeleteError(msg);
              announce(`Delete failed: ${msg}`);
            },
          });
        }}
        aria-label={`Delete '${todo.description || "task"}'`}
        aria-describedby={lastDeleteError ? deleteErrorId : undefined}
        className="h-11 shrink-0 truncate rounded-lg px-4 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-400"
      >
        {deleteMutation.isPending ? "Deleting…" : "Delete"}
      </button>
    </li>
  );
}
