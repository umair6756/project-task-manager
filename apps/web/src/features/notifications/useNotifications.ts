import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

const key = ["notifications"] as const;

export function useNotificationsList() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ notifications: AppNotification[] }>("/notifications") });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ notification: AppNotification }>(`/notifications/${id}/read`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
