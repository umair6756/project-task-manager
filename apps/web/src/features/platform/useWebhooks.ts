import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateWebhookInput, UpdateWebhookInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}

export interface WebhookDelivery {
  id: string;
  status: "pending" | "delivered" | "failed";
  attempts: number;
  createdAt: string;
}

const key = ["webhooks"] as const;

export function useWebhooks() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ webhooks: Webhook[] }>("/platform/webhooks") });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWebhookInput) => api.post<{ webhook: Webhook & { secret: string } }>("/platform/webhooks", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateWebhookInput }) => api.patch<{ webhook: Webhook }>(`/platform/webhooks/${id}`, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/platform/webhooks/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useWebhookDeliveries(id: string | null) {
  return useQuery({
    queryKey: [...key, id, "deliveries"],
    queryFn: () => api.get<{ deliveries: WebhookDelivery[] }>(`/platform/webhooks/${id}/deliveries`),
    enabled: !!id,
  });
}
