import { useHabitHeatmap } from "./useHabits";

export function HabitHeatmap({ habitId }: { habitId: string }) {
  const { data } = useHabitHeatmap(habitId);
  const heatmap = data?.heatmap ?? [];

  return (
    <div className="flex flex-wrap gap-1">
      {heatmap.slice(-84).map((h) => (
        <div
          key={h.date}
          title={`${h.date}: ${h.status}`}
          className="h-3 w-3 rounded-sm"
          style={{
            backgroundColor: h.status === "done" ? "hsl(var(--primary) / 0.85)" : h.status === "skipped" ? "hsl(var(--muted-foreground) / 0.4)" : "hsl(var(--secondary))",
          }}
        />
      ))}
      {heatmap.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
    </div>
  );
}
