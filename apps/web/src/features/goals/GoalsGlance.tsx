import { useGoals } from "./useGoals";
import { TrafficLightBadge } from "./TrafficLightBadge";

export function GoalsGlance() {
  const { data } = useGoals();
  const goals = (data?.goals ?? []).filter((g) => g.status === "active").slice(0, 4);

  if (goals.length === 0) return <p className="text-sm text-muted-foreground">No active goals.</p>;

  return (
    <ul className="space-y-2">
      {goals.map((g) => (
        <li key={g.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate">{g.title}</span>
            <TrafficLightBadge status={g.trafficLight} />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${g.progress}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
