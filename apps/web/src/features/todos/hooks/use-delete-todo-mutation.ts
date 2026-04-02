import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(
        `/api/v1/todos/${encodeURIComponent(id)}`,
        { method: "DELETE" },
        z.null()
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
