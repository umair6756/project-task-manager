import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateHabitInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { Habit } from "./types";

const key = ["habits"] as const;

export function useHabits(archived = false) {
  return useQuery({
    queryKey: [...key, archived],
    queryFn: () => api.get<{ habits: Habit[] }>(`/habits?archived=${archived}`),
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHabitInput) => api.post<{ habit: Habit }>("/habits", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Habit> }) => api.patch<{ habit: Habit }>(`/habits/${id}`, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useArchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ habit: Habit }>(`/habits/${id}/archive`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/habits/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useCheckinHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value, note }: { id: string; value?: number; note?: string }) =>
      api.post<{ habit: Habit; streakFreezeEarned: boolean; newlyEarned: unknown[] }>(`/habits/${id}/checkin`, { value, note }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useSkipHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.post<{ habit: Habit }>(`/habits/${id}/skip`, { reason }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useHabitHeatmap(id: string | null) {
  return useQuery({
    queryKey: [...key, id, "heatmap"],
    queryFn: () => api.get<{ heatmap: { date: string; status: "done" | "skipped" }[] }>(`/habits/${id}/heatmap`),
    enabled: !!id,
  });
}

export function useHabitCompletionRate(id: string | null, days = 30) {
  return useQuery({
    queryKey: [...key, id, "completion-rate", days],
    queryFn: () => api.get<{ days: number; doneCount: number; skippedCount: number; rate: number }>(`/habits/${id}/completion-rate?days=${days}`),
    enabled: !!id,
  });
}

export function useHabitStrength(id: string | null) {
  return useQuery({
    queryKey: [...key, id, "strength"],
    queryFn: () => api.get<{ strength: number }>(`/habits/${id}/strength`),
    enabled: !!id,
  });
}
