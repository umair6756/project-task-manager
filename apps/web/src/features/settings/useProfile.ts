import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import { useAuthStore, type AuthUser } from "@/stores/authStore";

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<{ user: AuthUser }>("/users/me", input),
    onSuccess: (res) => {
      if (accessToken && refreshToken) setSession(res.user, accessToken, refreshToken);
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.set("avatar", file);
      return api.post<{ avatarUrl: string }>("/users/me/avatar", form);
    },
    onSuccess: (res) => {
      const user = useAuthStore.getState().user;
      if (user && accessToken && refreshToken) setSession({ ...user, avatarUrl: res.avatarUrl }, accessToken, refreshToken);
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export interface UserSettings {
  accent?: string;
  areaBudgets?: Record<string, number>;
  notifications?: Record<string, boolean>;
  [key: string]: unknown;
}

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: () => api.get<{ settings: UserSettings }>("/users/me/settings") });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: UserSettings) => api.put<{ settings: UserSettings }>("/users/me/settings", settings),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
