import type React from "react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDeck, useDecks, useDeleteDeck } from "./useDecks";

export function DeckList({ onOpenDeck, onReview }: { onOpenDeck: (id: string) => void; onReview: (id: string) => void }) {
  const { data } = useDecks();
  const create = useCreateDeck();
  const del = useDeleteDeck();
  const [name, setName] = useState("");

  const decks = data?.decks ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim() });
    setName("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex gap-1.5">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New deck name" className="h-8 max-w-xs text-sm" />
        <Button type="submit" size="sm" disabled={!name.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {decks.map((deck) => (
          <div key={deck.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <button onClick={() => onOpenDeck(deck.id)} className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium">{deck.name}</p>
              <p className="text-xs text-muted-foreground">{deck.dueCount} due</p>
            </button>
            <div className="flex items-center gap-1">
              {deck.dueCount > 0 && (
                <Button size="sm" onClick={() => onReview(deck.id)}>
                  Review
                </Button>
              )}
              <button onClick={() => del.mutate(deck.id)} aria-label="Delete deck" className="p-1.5">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {decks.length === 0 && <p className="text-sm text-muted-foreground">No decks yet.</p>}
      </div>
    </div>
  );
}
