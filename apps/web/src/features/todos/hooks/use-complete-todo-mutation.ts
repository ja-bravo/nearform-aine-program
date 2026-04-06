import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";
import type { TodoDto } from "@/shared/api/schemas";
import { createTodoResponseSchema } from "@/shared/api/schemas";

type UseCompleteTodoMutationOptions = {
  onTodoUpdated?: (todo: TodoDto) => void;
};

export function useCompleteTodoMutation(
  options?: UseCompleteTodoMutationOptions
) {
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      fetchJson(
        `/api/v1/todos/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isCompleted }),
        },
        createTodoResponseSchema
      ),
    onSuccess: (data) => {
      options?.onTodoUpdated?.(data.data);
    },
  });
}
