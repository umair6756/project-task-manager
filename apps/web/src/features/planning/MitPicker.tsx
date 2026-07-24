import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTasks } from "@/features/tasks/useTasks";
import { useDailyPlan, useSetMits } from "./usePlanning";

export function MitPicker() {
  const { data: planData } = useDailyPlan();
  const { data: tasksData } = useTasks({ status: ["todo", "in-progress"] });
  const setMits = useSetMits();

  const plan = planData?.plan;
  const tasks = tasksData?.tasks ?? [];
  const mitIds = plan?.mitTaskIds ?? [];

  function toggle(id: string) {
    const next = mitIds.includes(id) ? mitIds.filter((m) => m !== id) : mitIds.length < 3 ? [...mitIds, id] : mitIds;
    setMits.mutate(next);
  }

  const mitTasks = mitIds.map((id) => tasks.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);
  const candidates = tasks.filter((t) => !mitIds.includes(t.id)).slice(0, 8);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Pick up to 3 Most Important Tasks for today</p>
      {mitTasks.length > 0 && (
        <ul className="space-y-1">
          {mitTasks.map((t) => (
            <li key={t.id}>
              <button onClick={() => toggle(t.id)} className="flex w-full items-center gap-2 rounded-md bg-accent px-2 py-1.5 text-left text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{t.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {mitIds.length < 3 && (
        <ul className="space-y-1">
          {candidates.map((t) => (
            <li key={t.id}>
              <button onClick={() => toggle(t.id)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent")}>
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </button>
            </li>
          ))}
          {candidates.length === 0 && mitTasks.length === 0 && <p className="text-sm text-muted-foreground">No open tasks.</p>}
        </ul>
      )}
    </div>
  );
}
