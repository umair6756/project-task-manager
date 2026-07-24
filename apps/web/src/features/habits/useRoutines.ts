import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRoutineInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { Routine, RoutineRun } from "./types";

const key = ["routines"] as const;

export function useRoutines() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ routines: Routine[] }>("/routines") });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoutineInput) => api.post<{ routine: Routine }>("/routines", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/routines/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useStartRun() {
  return useMutation({
    mutationFn: (routineId: string) => api.post<{ run: RoutineRun }>(`/routines/${routineId}/runs`),
  });
}

export function useCompleteRun() {
  return useMutation({
    mutationFn: ({ routineId, runId }: { routineId: string; runId: string }) => api.post<{ run: RoutineRun }>(`/routines/${routineId}/runs/${runId}/complete`),
  });
}
