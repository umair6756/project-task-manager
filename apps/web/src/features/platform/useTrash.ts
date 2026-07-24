import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface TrashItem {
  model: string;
  id: string;
  deletedAt: string;
  data: { title?: string; name?: string; [key: string]: unknown };
}

const key = ["trash"] as const;

export function useTrash() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ items: TrashItem[] }>("/trash") });
}

export function useRestoreTrashItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ model, id }: { model: string; id: string }) => api.post<{ restored: boolean }>(`/trash/${model}/${id}/restore`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function usePurgeTrashItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ model, id }: { model: string; id: string }) => api.delete<{ purged: boolean }>(`/trash/${model}/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
