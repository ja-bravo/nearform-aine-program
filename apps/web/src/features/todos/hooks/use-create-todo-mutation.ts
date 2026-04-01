import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";
import { createTodoResponseSchema } from "@/shared/api/schemas";

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
