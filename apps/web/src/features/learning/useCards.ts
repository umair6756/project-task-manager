import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { Card, ReviewGrade } from "./types";

const key = ["cards"] as const;

export function useCards(deckId?: string) {
  return useQuery({
    queryKey: [...key, deckId],
    queryFn: () => api.get<{ cards: Card[] }>(`/cards${deckId ? `?deckId=${deckId}` : ""}`),
    enabled: deckId !== undefined,
  });
}

export function useDueQueue(deckId?: string) {
  return useQuery({
    queryKey: [...key, "due", deckId],
    queryFn: () => api.get<{ cards: Card[]; count: number }>(`/cards/due${deckId ? `?deckId=${deckId}` : ""}`),
  });
}

export function useReviewHeatmap() {
  return useQuery({ queryKey: [...key, "heatmap"], queryFn: () => api.get<{ heatmap: { date: string; count: number }[] }>("/cards/heatmap") });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { deckId: string; front: string; back: string }) => api.post<{ card: Card }>("/cards", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useBulkCreateCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { deckId: string; cards: { front: string; back: string }[] }) => api.post<{ cards: Card[] }>("/cards/bulk", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/cards/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useReviewCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, grade }: { id: string; grade: ReviewGrade }) => api.post<{ card: Card }>(`/cards/${id}/review`, { grade }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
