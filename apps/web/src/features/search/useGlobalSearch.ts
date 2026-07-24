import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface SearchResult {
  type: "task" | "note" | "project" | "learningItem";
  id: string;
  title: string;
  score: number;
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.get<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 1,
  });
}
