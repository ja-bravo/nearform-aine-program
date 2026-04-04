"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type QuickCaptureValues,
  quickCaptureSchema,
} from "@/features/todos/capture-schema";
import { useCreateTodoMutation } from "@/features/todos/hooks/use-create-todo-mutation";
import { usePersistenceStatus } from "@/features/todos/hooks/use-persistence-status";
import { useConnectivity } from "@/shared/hooks/use-connectivity";
import { ApiError } from "@/shared/api/api-error";
import { PersistenceStatusBadge } from "./persistence-status-badge";

const ERROR_MESSAGE_FALLBACK = "Could not save your task. Try again.";

export function QuickCaptureBar() {
  const mutation = useCreateTodoMutation();
  const [lastError, setLastError] = useState<string | null>(null);
  const { isReadOnly } = useConnectivity();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setFocus,
  } = useForm<QuickCaptureValues>({
    resolver: zodResolver(quickCaptureSchema),
    defaultValues: { description: "" },
  });

  const persistenceStatus = usePersistenceStatus({
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    isPending: mutation.isPending,
  });

  const handleSuccess = () => {
    setLastError(null);
    reset({ description: "" });
    // AC5: Return focus to support rapid-fire entry, but only if not in read-only mode
    if (!isReadOnly) {
      setFocus("description");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (isReadOnly) return;
    try {
      mutation.reset();
      await mutation.mutateAsync({
        description: values.description.trim(),
      });
      handleSuccess();
    } catch (error) {
      setLastError(
        error instanceof ApiError ? error.message : ERROR_MESSAGE_FALLBACK
      );
    }
  });

  const handleRetry = async () => {
    try {
      await mutation.mutateAsync({
        description: getValues("description").trim(),
      });
      handleSuccess();
    } catch (error) {
      setLastError(
        error instanceof ApiError ? error.message : ERROR_MESSAGE_FALLBACK
      );
    }
  };

  const errorId = "quick-capture-error";

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 p-2 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1">
        <label
          htmlFor="quick-capture-description"
          className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          New task
        </label>
        <input
          id="quick-capture-description"
          type="text"
          autoComplete="off"
          placeholder="What needs doing?"
          className="h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-zinc-400"
          aria-invalid={errors.description || !!lastError ? "true" : "false"}
          aria-describedby={
            [
              errors.description ? "quick-capture-description-error" : null,
              lastError ? errorId : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          {...register("description", {
            onChange: () => {
              if (lastError) setLastError(null);
            },
          })}
        />
        {errors.description && (
          <p
            id="quick-capture-description-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.description.message}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <PersistenceStatusBadge status={persistenceStatus} />
          {lastError && (
            <div className="flex items-center gap-2" role="alert">
              <p
                id={errorId}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {lastError}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                disabled={mutation.isPending || isReadOnly}
                className="rounded text-xs font-medium text-red-800 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:no-underline disabled:opacity-60 dark:text-red-200 dark:focus-visible:ring-red-400"
              >
                {mutation.isPending ? "Retrying…" : "Retry"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0">
        <button
          type="submit"
          disabled={mutation.isPending || isReadOnly}
          className="h-12 w-full rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-100 sm:w-auto"
        >
          {mutation.isPending ? "Saving…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
