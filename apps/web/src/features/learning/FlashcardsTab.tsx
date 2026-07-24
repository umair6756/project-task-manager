import { useState } from "react";
import { DeckList } from "./DeckList";
import { DeckDetailPage } from "./DeckDetailPage";
import { ReviewMode } from "./ReviewMode";
import { ReviewHeatmap } from "./ReviewHeatmap";

export function FlashcardsTab() {
  const [deckId, setDeckId] = useState<string | null>(null);
  const [reviewingDeckId, setReviewingDeckId] = useState<string | null>(null);

  if (reviewingDeckId) return <ReviewMode deckId={reviewingDeckId} onClose={() => setReviewingDeckId(null)} />;
  if (deckId) return <DeckDetailPage deckId={deckId} onBack={() => setDeckId(null)} onReview={() => setReviewingDeckId(deckId)} />;

  return (
    <div className="space-y-6">
      <DeckList onOpenDeck={setDeckId} onReview={setReviewingDeckId} />
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Review activity</p>
        <ReviewHeatmap />
      </div>
    </div>
  );
}
