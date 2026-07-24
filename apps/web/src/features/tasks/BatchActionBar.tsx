import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBatchUpdateTasks } from "./useTasks";
import type { TaskPriority, TaskStatus } from "./types";

export function BatchActionBar({ selectedIds, onClear }: { selectedIds: string[]; onClear: () => void }) {
  const batch = useBatchUpdateTasks();

  if (selectedIds.length === 0) return null;

  function setStatus(status: TaskStatus) {
    batch.mutate({ ids: selectedIds, set: { status } });
    onClear();
  }
  function setPriority(priority: TaskPriority) {
    batch.mutate({ ids: selectedIds, set: { priority } });
    onClear();
  }

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <span className="text-sm font-medium">{selectedIds.length} selected</span>
      <div className="mx-2 h-4 w-px bg-border" />
      <Button variant="secondary" size="sm" onClick={() => setStatus("done")}>
        Mark done
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setStatus("cancelled")}>
        Cancel
      </Button>
      <select
        onChange={(e) => e.target.value && setPriority(e.target.value as TaskPriority)}
        defaultValue=""
        className="rounded-md border border-input bg-transparent px-2 py-1 text-xs"
      >
        <option value="" disabled>
          Set priority
        </option>
        {(["P1", "P2", "P3", "P4"] as const).map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <Button variant="ghost" size="icon" className="ml-auto" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
