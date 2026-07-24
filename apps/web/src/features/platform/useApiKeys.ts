import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
}

const key = ["api-keys"] as const;

export function useApiKeys() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ keys: ApiKey[] }>("/platform/api-keys") });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<{ apiKey: ApiKey; rawKey: string }>("/platform/api-keys", { name }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ revoked: boolean }>(`/platform/api-keys/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
