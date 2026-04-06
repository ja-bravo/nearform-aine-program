import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";
import type { TodoDto } from "@/shared/api/schemas";
import { createTodoResponseSchema } from "@/shared/api/schemas";

type UseCreateTodoMutationOptions = {
  onTodoCreated?: (todo: TodoDto) => void;
};

export function useCreateTodoMutation(
  options?: UseCreateTodoMutationOptions
) {
  return useMutation({
    mutationFn: (body: { description: string }) =>
      fetchJson(
        "/api/v1/todos",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        createTodoResponseSchema
      ),
    onSuccess: (data) => {
      options?.onTodoCreated?.(data.data);
    },
  });
}
