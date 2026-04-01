import { useQuery } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/shared/api/env";
import { fetchJson } from "@/shared/api/fetch-json";
import { listTodosResponseSchema } from "@/shared/api/schemas";

export function useTodosQuery() {
  const base = getApiBaseUrl();
  return useQuery({
    queryKey: ["todos"],
    queryFn: () =>
      fetchJson("/api/v1/todos", { method: "GET" }, listTodosResponseSchema),
    enabled: Boolean(base),
  });
}
