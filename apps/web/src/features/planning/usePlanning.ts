import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface DailyPlan {
  id: string;
  dateKey: string;
  mitTaskIds: string[];
  planNotes: string;
  shutdownNotes: string;
  tomorrowNotes: string;
  shutdownDone: boolean;
}

const key = ["planning", "daily"] as const;

export function useDailyPlan() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ plan: DailyPlan }>("/planning/daily") });
}

export function useSetMits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: string[]) => api.put<{ plan: DailyPlan }>("/planning/mits", { taskIds }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdatePlanNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planNotes: string) => api.patch<{ plan: DailyPlan }>("/planning/daily", { planNotes }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useShutdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { shutdownNotes?: string; tomorrowNotes?: string }) => api.post<{ plan: DailyPlan }>("/planning/shutdown", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
