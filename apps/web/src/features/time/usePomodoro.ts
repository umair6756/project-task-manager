import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { PomodoroSession } from "./types";

export function useStartPomodoro() {
  return useMutation({
    mutationFn: (input: { taskId?: string | null; workLenMin?: number; breakLenMin?: number; cycles?: number }) =>
      api.post<{ session: PomodoroSession }>("/pomodoro", input),
  });
}

export function useCompleteCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ session: PomodoroSession }>(`/pomodoro/${id}/complete-cycle`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["time-entries"] }),
  });
}

export function useStopPomodoro() {
  return useMutation({
    mutationFn: (id: string) => api.post<{ session: PomodoroSession }>(`/pomodoro/${id}/stop`),
  });
}
