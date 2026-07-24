import { useState } from "react";
import { useYearInReview } from "./useReviews";

export function YearInReviewPage() {
  const [year] = useState(new Date().getFullYear());
  const { data } = useYearInReview(year);

  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Your {year} wrapped</p>
        <p className="mt-2 text-4xl font-bold">{data.completedStats.total}</p>
        <p className="text-sm text-muted-foreground">tasks completed</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data.completedStats.byPriority).map(([priority, count]) => (
          <div key={priority} className="rounded-lg border border-border p-3 text-center">
            <p className="text-lg font-semibold">{count}</p>
            <p className="text-xs text-muted-foreground">{priority}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Habits this year</p>
        {data.habitRates.map((h) => (
          <p key={h.habitId} className="text-sm">
            {h.name}: {h.rate}% consistency
          </p>
        ))}
        {data.habitRates.length === 0 && <p className="text-sm text-muted-foreground">No habits tracked.</p>}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Goals</p>
        {data.goalStatuses.map((g) => (
          <p key={g.goalId} className="text-sm">
            {g.title}: {g.progress}%
          </p>
        ))}
        {data.goalStatuses.length === 0 && <p className="text-sm text-muted-foreground">No active goals.</p>}
      </div>
    </div>
  );
}
