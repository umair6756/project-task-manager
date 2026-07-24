import { useEffect, useState } from "react";
import { marked } from "marked";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useDueQueue, useReviewCard } from "./useCards";
import type { ReviewGrade } from "./types";

const GRADES: { grade: ReviewGrade; label: string; key: string; className: string }[] = [
  { grade: "again", label: "Again", key: "1", className: "bg-red-500/20 text-red-400 hover:bg-red-500/30" },
  { grade: "hard", label: "Hard", key: "2", className: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" },
  { grade: "good", label: "Good", key: "3", className: "bg-green-500/20 text-green-400 hover:bg-green-500/30" },
  { grade: "easy", label: "Easy", key: "4", className: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" },
];

export function ReviewMode({ deckId, onClose }: { deckId: string; onClose: () => void }) {
  const { data, isLoading } = useDueQueue(deckId);
  const review = useReviewCard();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const cards = data?.cards ?? [];
  const card = cards[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return onClose();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        return setFlipped((v) => !v);
      }
      if (!flipped) return;
      const match = GRADES.find((g) => g.key === e.key);
      if (match) void grade(match.grade);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, card?.id]);

  async function grade(g: ReviewGrade) {
    if (!card) return;
    await review.mutateAsync({ id: card.id, grade: g });
    setReviewedCount((c) => c + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">
          {Math.min(index + 1, cards.length)} / {cards.length}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !card ? (
          <div className="text-center">
            <p className="text-lg font-medium">Session complete</p>
            <p className="mt-1 text-sm text-muted-foreground">Reviewed {reviewedCount} card{reviewedCount === 1 ? "" : "s"}.</p>
            <Button className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setFlipped((v) => !v)}
            className="flex min-h-64 w-full max-w-lg flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-lg"
          >
            <div
              className="note-preview max-w-full text-lg"
              dangerouslySetInnerHTML={{ __html: marked.parse(flipped ? card.back : card.front) as string }}
            />
            {!flipped && <p className="mt-6 text-xs text-muted-foreground">Space / click to flip</p>}
          </button>
        )}
      </div>

      {card && (
        <div className={cn("grid grid-cols-4 gap-2 p-4 transition-opacity", !flipped && "pointer-events-none opacity-0")}>
          {GRADES.map((g) => (
            <button key={g.grade} onClick={() => void grade(g.grade)} className={cn("rounded-lg py-3 text-sm font-medium", g.className)}>
              {g.label}
              <span className="ml-1.5 text-xs opacity-60">({g.key})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
