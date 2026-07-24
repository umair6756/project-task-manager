import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { Notebook } from "./types";

const key = ["notebooks"] as const;

export function useNotebooks() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ notebooks: Notebook[] }>("/notebooks") });
}

export function useCreateNotebook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; parentId?: string | null }) => api.post<{ notebook: Notebook }>("/notebooks", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateNotebook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Notebook> }) => api.patch<{ notebook: Notebook }>(`/notebooks/${id}`, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteNotebook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/notebooks/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
