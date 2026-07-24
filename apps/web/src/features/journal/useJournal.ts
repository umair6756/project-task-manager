import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpsertJournalEntryInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";

export interface JournalEntry {
  id: string;
  dateKey: string;
  mood: number;
  text: string;
}

const key = ["journal"] as const;

export function useJournalEntries() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ entries: JournalEntry[] }>("/journal") });
}

export function useUpsertJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertJournalEntryInput) => api.post<{ entry: JournalEntry }>("/journal", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useMoodCorrelation(days = 90) {
  return useQuery({
    queryKey: [...key, "mood-correlation", days],
    queryFn: () => api.get<{ points: { dateKey: string; mood: number; tasksCompleted: number }[]; correlation: number | null }>(`/journal/mood-correlation?days=${days}`),
  });
}
