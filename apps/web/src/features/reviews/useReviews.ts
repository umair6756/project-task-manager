import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SaveWeeklyReviewInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";

export interface ReviewPackage {
  completedStats: { total: number; byPriority: Record<string, number> };
  timeByArea: { areaId: string | null; minutes: number }[];
  habitRates: { habitId: string; name: string; rate: number }[];
  overdue: { id: string; title: string; dueAt: string; priority: string }[];
  inboxCount: number;
  goalStatuses: { goalId: string; title: string; progress: number; trafficLight: string }[];
  prompts: string[];
}

export interface WeeklyReviewData extends ReviewPackage {
  isoWeek: string;
  savedAnswers: { wentWell?: string; didntGoWell?: string; lessons?: string } | null;
}

export function useWeeklyReview(isoWeek: string) {
  return useQuery({ queryKey: ["reviews", "week", isoWeek], queryFn: () => api.get<WeeklyReviewData>(`/reviews/week/${isoWeek}`) });
}

export function useSaveWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ isoWeek, input }: { isoWeek: string; input: SaveWeeklyReviewInput }) => api.post(`/reviews/week/${isoWeek}`, input),
    onSuccess: (_res, { isoWeek }) => void qc.invalidateQueries({ queryKey: ["reviews", "week", isoWeek] }),
  });
}

export function useMonthlyReview(yearMonth: string) {
  return useQuery({ queryKey: ["reviews", "month", yearMonth], queryFn: () => api.get<ReviewPackage & { yearMonth: string }>(`/reviews/month/${yearMonth}`) });
}

export function useYearInReview(year: number) {
  return useQuery({ queryKey: ["reviews", "year", year], queryFn: () => api.get<ReviewPackage & { year: number }>(`/reviews/year/${year}`) });
}
