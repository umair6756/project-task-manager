import { CheckSquare } from "lucide-react";
import type { Subtask } from "./types";

export function SubtaskProgress({ subtasks }: { subtasks: Subtask[] }) {
  if (subtasks.length === 0) return null;
  const done = subtasks.filter((s) => s.done).length;
  const pct = Math.round((done / subtasks.length) * 100);

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <CheckSquare className="h-3 w-3 shrink-0" />
      <span className="shrink-0">
        {done}/{subtasks.length}
      </span>
      <div className="h-1 w-10 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
