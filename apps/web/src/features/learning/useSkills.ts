import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { Skill } from "./types";

const key = ["skills"] as const;

export function useSkills() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ skills: Skill[] }>("/skills") });
}

export function useSkillRadar() {
  return useQuery({
    queryKey: [...key, "radar"],
    queryFn: () => api.get<{ radar: { name: string; level: number; category?: string }[] }>("/skills/radar"),
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; level?: number; category?: string }) => api.post<{ skill: Skill }>("/skills", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, "radar"] });
    },
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Skill> }) => api.patch<{ skill: Skill }>(`/skills/${id}`, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, "radar"] });
    },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/skills/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, "radar"] });
    },
  });
}
