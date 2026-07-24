import { useState } from "react";
import { SmartViewList } from "../SmartViewList";
import { useUpcomingView } from "../useViews";

export function UpcomingViewPage() {
  const [days, setDays] = useState(7);
  const { data, isLoading } = useUpcomingView(days);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Range:</span>
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-md px-2 py-1 ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            {d}d
          </button>
        ))}
      </div>
      {isLoading || !data ? <p className="text-sm text-muted-foreground">Loading...</p> : <SmartViewList sections={[{ label: `Next ${days} days`, tasks: data.tasks }]} />}
    </div>
  );
}
