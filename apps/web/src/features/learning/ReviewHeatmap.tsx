import { useReviewHeatmap } from "./useCards";

// Simple 7-column grid heatmap (last ~12 weeks) rather than a full calendar
// layout — enough to show review consistency at a glance.
export function ReviewHeatmap() {
  const { data } = useReviewHeatmap();
  const heatmap = data?.heatmap ?? [];
  const max = Math.max(1, ...heatmap.map((h) => h.count));

  return (
    <div className="flex flex-wrap gap-1">
      {heatmap.slice(-84).map((h) => {
        const intensity = h.count === 0 ? 0 : Math.min(1, h.count / max);
        return (
          <div
            key={h.date}
            title={`${h.date}: ${h.count} reviews`}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: intensity === 0 ? "hsl(var(--secondary))" : `hsl(var(--primary) / ${0.25 + intensity * 0.75})` }}
          />
        );
      })}
      {heatmap.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
    </div>
  );
}
