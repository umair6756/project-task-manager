import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { Deck } from "./types";

const key = ["decks"] as const;

export function useDecks() {
  return useQuery({ queryKey: key, queryFn: () => api.get<{ decks: Deck[] }>("/decks") });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) => api.post<{ deck: Deck }>("/decks", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/decks/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeckStats(id: string | null) {
  return useQuery({
    queryKey: [...key, id, "stats"],
    queryFn: () => api.get<{ retention: number | null; forecast: { dateKey: string; count: number }[] }>(`/decks/${id}/stats`),
    enabled: !!id,
  });
}
