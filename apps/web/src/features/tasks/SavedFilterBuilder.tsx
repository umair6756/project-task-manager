import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useCreateSavedFilter } from "./useSavedFilters";
import type { TaskPriority, TaskStatus } from "./types";

const ALL_STATUSES: TaskStatus[] = ["todo", "in-progress", "blocked", "done", "cancelled"];
const ALL_PRIORITIES: TaskPriority[] = ["P1", "P2", "P3", "P4"];

export function SavedFilterBuilder({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [statuses, setStatuses] = useState<Set<TaskStatus>>(new Set());
  const [priorities, setPriorities] = useState<Set<TaskPriority>>(new Set());
  const create = useCreateSavedFilter();

  function toggle<T>(set: Set<T>, setSet: (s: Set<T>) => void, value: T) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSet(next);
  }

  async function save() {
    if (!name.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      query: {
        status: statuses.size ? Array.from(statuses) : undefined,
        priority: priorities.size ? Array.from(priorities) : undefined,
      },
      pinned: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold">New saved filter</h2>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Filter name" autoFocus />

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => toggle(statuses, setStatuses, s)}
                className={cn("rounded-full border px-2.5 py-1 text-xs", statuses.has(s) ? "border-primary bg-primary text-primary-foreground" : "border-border")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => toggle(priorities, setPriorities, p)}
                className={cn("rounded-full border px-2.5 py-1 text-xs", priorities.has(p) ? "border-primary bg-primary text-primary-foreground" : "border-border")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={create.isPending || !name.trim()}>
            Save filter
          </Button>
        </div>
      </div>
    </div>
  );
}
