import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateSavedFilterInput, SavedFilterQuery } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { Task } from "./types";

export interface SavedFilter {
  id: string;
  name: string;
  query: SavedFilterQuery;
  pinned: boolean;
}

const key = ["saved-filters"] as const;

export function useSavedFilters() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ filters: SavedFilter[] }>("/saved-filters") });
}

export function useCreateSavedFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSavedFilterInput) => api.post<{ filter: SavedFilter }>("/saved-filters", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteSavedFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/saved-filters/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useExecuteSavedFilter(id: string | null) {
  return useQuery({
    queryKey: [...key, id, "execute"],
    queryFn: () => api.get<{ tasks: Task[] }>(`/saved-filters/${id}/execute`),
    enabled: !!id,
  });
}
