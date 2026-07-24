import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks, useUpdateTask } from "./useTasks";
import type { Task } from "./types";

export function DependencyPicker({ task }: { task: Task }) {
  const { data } = useTasks();
  const update = useUpdateTask();
  const [adding, setAdding] = useState(false);

  const all = data?.tasks ?? [];
  const depTasks = task.dependsOn.map((id) => all.find((t) => t.id === id)).filter((t): t is Task => !!t);
  const candidates = all.filter((t) => t.id !== task.id && !task.dependsOn.includes(t.id) && t.status !== "done");

  function remove(id: string) {
    update.mutate({ id: task.id, patch: { dependsOn: task.dependsOn.filter((d) => d !== id) } });
  }
  function add(id: string) {
    update.mutate({ id: task.id, patch: { dependsOn: [...task.dependsOn, id] } });
    setAdding(false);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Blocked by</span>
        <Button variant="ghost" size="icon" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-1">
        {depTasks.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded bg-secondary px-2 py-1 text-sm">
            <span className={d.status === "done" ? "text-muted-foreground line-through" : ""}>{d.title}</span>
            <button onClick={() => remove(d.id)} aria-label="Remove dependency">
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </li>
        ))}
        {depTasks.length === 0 && <li className="text-xs text-muted-foreground">No blockers</li>}
      </ul>
      {adding && (
        <ul className="max-h-32 space-y-0.5 overflow-y-auto rounded border border-border">
          {candidates.map((c) => (
            <li key={c.id}>
              <button onClick={() => add(c.id)} className="w-full truncate px-2 py-1 text-left text-sm hover:bg-accent">
                {c.title}
              </button>
            </li>
          ))}
          {candidates.length === 0 && <li className="px-2 py-1 text-xs text-muted-foreground">No other open tasks</li>}
        </ul>
      )}
    </div>
  );
}
