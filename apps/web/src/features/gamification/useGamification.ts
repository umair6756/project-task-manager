import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export interface AchievementView {
  key: string;
  name: string;
  description: string;
  category: string;
  statKey: string;
  threshold: number;
  xpReward: number;
  earned: boolean;
  currentValue: number;
}

export interface GamificationMe {
  levelInfo: LevelInfo;
  achievements: AchievementView[];
  freezeTokensAvailable: number;
}

export function useGamificationMe() {
  return useQuery({ queryKey: ["gamification", "me"], queryFn: () => api.get<GamificationMe>("/gamification/me") });
}

export function useSpendStreakFreeze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { habitId: string; dateKey?: string }) => api.post<{ spent: boolean; dateKey: string }>("/gamification/streak-freeze/spend", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["gamification"] });
      void qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
