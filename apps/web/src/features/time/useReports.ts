import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

function range(from: Date, to: Date): string {
  return `from=${from.toISOString()}&to=${to.toISOString()}`;
}

export function useTimeByProject(from: Date, to: Date) {
  return useQuery({
    queryKey: ["reports", "time-by-project", from, to],
    queryFn: () => api.get<{ byProject: { projectId: string; minutes: number }[] }>(`/reports/time-by-project?${range(from, to)}`),
  });
}

export function useTimeByArea(from: Date, to: Date) {
  return useQuery({
    queryKey: ["reports", "time-by-area", from, to],
    queryFn: () => api.get<{ byArea: { areaId: string; minutes: number }[] }>(`/reports/time-by-area?${range(from, to)}`),
  });
}

export function useDailyTimeline(from: Date, to: Date) {
  return useQuery({
    queryKey: ["reports", "daily-timeline", from, to],
    queryFn: () => api.get<{ entries: { id: string; start: string; end: string | null; source: string; note?: string }[] }>(`/reports/daily-timeline?${range(from, to)}`),
  });
}

export function useDeepWorkHeat(from: Date, to: Date) {
  return useQuery({
    queryKey: ["reports", "deep-work-heat", from, to],
    queryFn: () => api.get<{ byHour: number[] }>(`/reports/deep-work-heat?${range(from, to)}`),
  });
}

export function useEstimatesVsActuals(projectId: string | null) {
  return useQuery({
    queryKey: ["reports", "estimates-vs-actuals", projectId],
    queryFn: () => api.get<{ estimateMin: number; actualMin: number }>(`/reports/estimates-vs-actuals/${projectId}`),
    enabled: !!projectId,
  });
}

export function useAreaBudgets() {
  return useQuery({
    queryKey: ["reports", "area-budgets"],
    queryFn: () => api.get<{ budgets: { areaId: string; budgetHours: number; consumedHours: number; consumedPercent: number }[] }>("/reports/area-budgets"),
  });
}
