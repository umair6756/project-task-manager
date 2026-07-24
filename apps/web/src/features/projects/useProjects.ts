import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface Project {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  status: string;
  areaId?: string | null;
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<{ projects: Project[] }>("/projects"),
  });
}
