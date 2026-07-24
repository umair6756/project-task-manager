import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface LabelDoc {
  id: string;
  name: string;
  color?: string;
}

export function useLabels() {
  return useQuery({
    queryKey: ["labels"],
    queryFn: () => api.get<{ labels: LabelDoc[] }>("/labels"),
  });
}
