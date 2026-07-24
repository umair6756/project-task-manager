import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { Task } from "./types";

export function useTodayView() {
  return useQuery({
    queryKey: ["views", "today"],
    queryFn: () => api.get<{ overdue: Task[]; dueToday: Task[]; startingToday: Task[] }>("/views/today"),
  });
}

export function useUpcomingView(days = 7) {
  return useQuery({
    queryKey: ["views", "upcoming", days],
    queryFn: () => api.get<{ tasks: Task[]; rangeDays: number }>(`/views/upcoming?days=${days}`),
  });
}

export function useInboxView() {
  return useQuery({
    queryKey: ["views", "inbox"],
    queryFn: () => api.get<{ tasks: Task[] }>("/views/inbox"),
  });
}

export function useAnytimeView() {
  return useQuery({
    queryKey: ["views", "anytime"],
    queryFn: () => api.get<{ tasks: Task[] }>("/views/anytime"),
  });
}
