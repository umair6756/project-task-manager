import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { Certificate } from "./types";

const key = ["certificates"] as const;

export function useCertificates() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ certificates: Certificate[] }>("/certificates") });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; issuer?: string; expiresAt?: string; file?: File }) => {
      const form = new FormData();
      form.set("title", input.title);
      if (input.issuer) form.set("issuer", input.issuer);
      if (input.expiresAt) form.set("expiresAt", input.expiresAt);
      if (input.file) form.set("file", input.file);
      return api.post<{ certificate: Certificate }>("/certificates", form);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/certificates/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
