import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";
import { createTodoResponseSchema } from "@/shared/api/schemas";

export function useCompleteTodoMutation() {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
