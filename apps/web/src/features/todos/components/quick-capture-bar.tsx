"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type QuickCaptureValues,
  quickCaptureSchema,
} from "@/features/todos/capture-schema";
import { useCreateTodoMutation } from "@/features/todos/hooks/use-create-todo-mutation";
import { ApiError } from "@/shared/api/api-error";

export function QuickCaptureBar() {
  const mutation = useCreateTodoMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickCaptureValues>({
    resolver: zodResolver(quickCaptureSchema),
    defaultValues: { description: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    mutation.reset();
    await mutation.mutateAsync({
      description: values.description.trim(),
    });
    reset({ description: "" });
  });

  const submitError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Could not save your task. Try again."
        : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 p-2 sm:flex-row sm:items-start"
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
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 focus-visible:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-500"
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={
            errors.description ? "quick-capture-description-error" : undefined
          }
          {...register("description")}
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
        {submitError && (
          <p
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {submitError}
          </p>
        )}
      </div>
      <div className="flex shrink-0 sm:pt-7">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-10 w-full rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100 sm:w-auto"
        >
          {mutation.isPending ? "Saving…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
