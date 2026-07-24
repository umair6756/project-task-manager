import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface Area {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export function useAreas() {
  return useQuery({ queryKey: ["areas"], queryFn: () => api.get<{ areas: Area[] }>("/areas") });
}
