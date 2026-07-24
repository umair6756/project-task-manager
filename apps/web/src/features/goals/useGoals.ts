import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateGoalInput, CreateKeyResultInput, CreateGoalCheckInInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { Goal, GoalCheckIn, GoalHorizon } from "./types";

const key = ["goals"] as const;

export function useGoals(horizon?: GoalHorizon) {
  return useQuery({
    queryKey: [...key, horizon],
    queryFn: () => api.get<{ goals: Goal[] }>(`/goals${horizon ? `?horizon=${horizon}` : ""}`),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => api.post<{ goal: Goal }>("/goals", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Goal> }) => api.patch<{ goal: Goal }>(`/goals/${id}`, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useArchiveGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcomeNote }: { id: string; outcomeNote?: string }) => api.post<{ goal: Goal }>(`/goals/${id}/archive`, { outcomeNote }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/goals/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useCreateKeyResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: CreateKeyResultInput }) => api.post<{ keyResult: unknown }>(`/goals/${goalId}/key-results`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateKeyResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, keyResultId, patch }: { goalId: string; keyResultId: string; patch: Record<string, unknown> }) =>
      api.patch<{ keyResult: unknown }>(`/goals/${goalId}/key-results/${keyResultId}`, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteKeyResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, keyResultId }: { goalId: string; keyResultId: string }) => api.delete<{ deleted: boolean }>(`/goals/${goalId}/key-results/${keyResultId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useCheckIns(goalId: string | null) {
  return useQuery({
    queryKey: [...key, goalId, "check-ins"],
    queryFn: () => api.get<{ checkIns: GoalCheckIn[] }>(`/goals/${goalId}/check-ins`),
    enabled: !!goalId,
  });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: CreateGoalCheckInInput }) => api.post<{ checkIn: GoalCheckIn }>(`/goals/${goalId}/check-ins`, input),
    onSuccess: (_res, { goalId }) => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, goalId, "check-ins"] });
    },
  });
}
