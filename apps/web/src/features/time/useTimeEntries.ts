import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateManualEntryInput, UpdateManualEntryInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { TimeEntry } from "./types";

const key = ["time-entries"] as const;
const runningKey = [...key, "running"] as const;

// Polled rather than socket-pushed — the backend only emits
// notification.new over the socket (see memory), no timer.tick event
// exists, so cross-tab sync happens via a short poll interval instead.
export function useRunningTimer() {
  return useQuery({
    queryKey: runningKey,
    queryFn: () => api.get<{ running: TimeEntry | null }>("/time-entries/running"),
    refetchInterval: 5000,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { taskId?: string | null; learningItemId?: string | null; note?: string }) => api.post<{ entry: TimeEntry }>("/time-entries/start", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: runningKey }),
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ entry: TimeEntry }>("/time-entries/stop"),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: runningKey });
      void qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useTimeEntries() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ entries: TimeEntry[] }>("/time-entries") });
}

export function useCreateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateManualEntryInput) => api.post<{ entry: TimeEntry }>("/time-entries", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateManualEntryInput }) => api.patch<{ entry: TimeEntry }>(`/time-entries/${id}`, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/time-entries/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
