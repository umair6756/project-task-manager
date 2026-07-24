import type React from "react";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCards, useCreateCard, useDeleteCard } from "./useCards";
import { DeckStatsChart } from "./DeckStatsChart";

export function DeckDetailPage({ deckId, onBack, onReview }: { deckId: string; onBack: () => void; onReview: () => void }) {
  const { data } = useCards(deckId);
  const create = useCreateCard();
  const del = useDeleteCard();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const cards = data?.cards ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    await create.mutateAsync({ deckId, front: front.trim(), back: back.trim() });
    setFront("");
    setBack("");
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button size="sm" onClick={onReview}>
          Start review
        </Button>
      </div>

      <DeckStatsChart deckId={deckId} />

      <form onSubmit={submit} className="space-y-2 rounded-lg border border-border p-3">
        <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (markdown)" rows={2} className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none" />
        <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (markdown)" rows={2} className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none" />
        <Button type="submit" size="sm" disabled={!front.trim() || !back.trim() || create.isPending}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add card
        </Button>
      </form>

      <ul className="space-y-1.5">
        {cards.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate">{c.front}</p>
              <p className="truncate text-xs text-muted-foreground">{c.back}</p>
            </div>
            <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">{c.srs.state}</span>
            <button onClick={() => del.mutate(c.id)} aria-label="Delete card">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </li>
        ))}
        {cards.length === 0 && <p className="text-sm text-muted-foreground">No cards yet.</p>}
      </ul>
    </div>
  );
}
