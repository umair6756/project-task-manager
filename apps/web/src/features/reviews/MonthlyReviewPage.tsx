import { useState } from "react";
import { format } from "date-fns";
import { useMonthlyReview } from "./useReviews";

export function MonthlyReviewPage() {
  const [yearMonth] = useState(format(new Date(), "yyyy-MM"));
  const { data } = useMonthlyReview(yearMonth);

  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Month {yearMonth}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Completed tasks</p>
          <p className="text-xl font-semibold">{data.completedStats.total}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Inbox</p>
          <p className="text-xl font-semibold">{data.inboxCount}</p>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Habit rates</p>
        {data.habitRates.map((h) => (
          <p key={h.habitId} className="text-sm">
            {h.name}: {h.rate}%
          </p>
        ))}
        {data.habitRates.length === 0 && <p className="text-sm text-muted-foreground">No habits tracked.</p>}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Goals</p>
        {data.goalStatuses.map((g) => (
          <p key={g.goalId} className="text-sm">
            {g.title}: {g.progress}% ({g.trafficLight})
          </p>
        ))}
      </div>
    </div>
  );
}
