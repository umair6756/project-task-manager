import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateLearningItemInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { LearningItem, LearningItemStatus } from "./types";

const key = ["learning-items"] as const;

export function useLearningItems(status?: LearningItemStatus) {
  return useQuery({
    queryKey: [...key, status],
    queryFn: () => api.get<{ items: LearningItem[] }>(`/learning-items${status ? `?status=${status}` : ""}`),
  });
}

export function useLearningItem(id: string | null) {
  return useQuery({
    queryKey: [...key, "one", id],
    queryFn: () => api.get<{ item: LearningItem }>(`/learning-items/${id}`),
    enabled: !!id,
  });
}

export function useLearningStats() {
  return useQuery({
    queryKey: [...key, "stats"],
    queryFn: () => api.get<{ itemsByStatus: Record<string, number>; streak: { current: number; best: number } }>("/learning-items/stats"),
  });
}

export function useCreateLearningItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLearningItemInput) => api.post<{ item: LearningItem }>("/learning-items", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateLearningItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<LearningItem> }) => api.patch<{ item: LearningItem }>(`/learning-items/${id}`, patch),
    onSuccess: (_res, { id }) => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, "one", id] });
    },
  });
}

export function useDeleteLearningItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/learning-items/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useAddProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value, note }: { id: string; value: number; note?: string }) => api.post<{ item: LearningItem }>(`/learning-items/${id}/progress`, { value, note }),
    onSuccess: (_res, { id }) => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, "one", id] });
    },
  });
}
