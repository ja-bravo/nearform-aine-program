import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/shared/api/fetch-json";

type UseDeleteTodoMutationOptions = {
  onTodoDeleted?: (id: string) => void;
};

export function useDeleteTodoMutation(
  options?: UseDeleteTodoMutationOptions
) {
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(
        `/api/v1/todos/${encodeURIComponent(id)}`,
        { method: "DELETE" },
        z.null()
      ),
    onSuccess: (_data, id) => {
      options?.onTodoDeleted?.(id);
    },
  });
}
