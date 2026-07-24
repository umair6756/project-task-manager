import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface TrendsData {
  velocity: { date: string; completed: number }[];
  completionRate: number;
  overdueRatio: number;
  bestHours: number[];
  procrastination: {
    byProject: { projectId: string | null; avgPostpones: number; count: number }[];
    byLabel: { labelId: string; avgPostpones: number; count: number }[];
  };
  records: {
    mostTasksCompletedInADay: { date: string; count: number } | null;
    longestHabitStreak: { habitId: string; name: string; streak: number } | null;
    bestProductivityDay: { date: string; score: number } | null;
  };
}

function range(days: number) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  return `from=${from.toISOString()}&to=${to.toISOString()}`;
}

export function useTrends(days = 30) {
  return useQuery({ queryKey: ["analytics", "trends", days], queryFn: () => api.get<TrendsData>(`/analytics/trends?${range(days)}`) });
}

export function useTodayScore() {
  return useQuery({
    queryKey: ["analytics", "score", "today"],
    queryFn: () => api.get<{ score: number; tasksScore: number; focusScore: number; habitScore: number; mitScore: number }>("/analytics/score/today"),
  });
}

export function useScoreHistory(days = 30) {
  return useQuery({
    queryKey: ["analytics", "score", "history", days],
    queryFn: () => api.get<{ scores: { dateKey: string; score: number }[] }>(`/analytics/score/history?${range(days)}`),
  });
}

export function useProjectBurndown(projectId: string | null, days = 30) {
  return useQuery({
    queryKey: ["analytics", "burndown", projectId, days],
    queryFn: () => api.get<{ burndown: { date: string; remaining: number }[] }>(`/analytics/projects/${projectId}/burndown?${range(days)}`),
    enabled: !!projectId,
  });
}

export function useProjectCfd(projectId: string | null, days = 30) {
  return useQuery({
    queryKey: ["analytics", "cfd", projectId, days],
    queryFn: () => api.get<{ cfd: { date: string; open: number; done: number }[] }>(`/analytics/projects/${projectId}/cfd?${range(days)}`),
    enabled: !!projectId,
  });
}
