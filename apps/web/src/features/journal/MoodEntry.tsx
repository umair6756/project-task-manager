import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useUpsertJournalEntry } from "./useJournal";

const MOODS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

export function MoodEntry() {
  const upsert = useUpsertJournalEntry();
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState("");

  async function save() {
    if (!mood) return;
    await upsert.mutateAsync({ mood, text: text || undefined });
    setText("");
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">How are you feeling today?</p>
      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMood(m.value)}
            className={cn("flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-transform", mood === m.value ? "scale-110 border-primary bg-primary/10" : "border-border")}
          >
            {m.emoji}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Journal entry (optional)..."
        rows={3}
        className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button size="sm" onClick={() => void save()} disabled={!mood || upsert.isPending}>
        Save
      </Button>
    </div>
  );
}
