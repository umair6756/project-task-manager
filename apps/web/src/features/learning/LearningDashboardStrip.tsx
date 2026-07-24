import { useLearningStats } from "./useLearningItems";

export function LearningDashboardStrip() {
  const { data } = useLearningStats();
  if (!data) return null;

  const { itemsByStatus, streak } = data;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Learning</p>
        <p className="text-xl font-semibold">{itemsByStatus.learning ?? 0}</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Completed</p>
        <p className="text-xl font-semibold">{itemsByStatus.completed ?? 0}</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Current streak</p>
        <p className="text-xl font-semibold">{streak.current}d</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Best streak</p>
        <p className="text-xl font-semibold">{streak.best}d</p>
      </div>
    </div>
  );
}
