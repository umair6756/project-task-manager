import type React from "react";
import { format, isPast } from "date-fns";
import { Check, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { priorityColor } from "./priority";
import type { Task } from "./types";

interface TaskRowProps {
  task: Task;
  onComplete: () => void;
  onOpen: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function TaskRow({ task, onComplete, onOpen, selected, onToggleSelect, dragHandleProps }: TaskRowProps) {
  const done = task.status === "done";
  const overdue = !done && task.dueAt && isPast(new Date(task.dueAt));

  return (
    <div className={cn("group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent/50", selected && "bg-accent/70")}>
      {dragHandleProps && (
        <button {...dragHandleProps} className="shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" aria-label="Drag to reorder">
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {onToggleSelect && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 shrink-0"
        />
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
          done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 hover:border-primary",
        )}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        {done && <Check className="h-3 w-3" />}
      </button>

      <button onClick={onOpen} className="min-w-0 flex-1 truncate text-left text-sm">
        <span className={cn(done && "text-muted-foreground line-through")}>{task.title}</span>
      </button>

      {task.priority !== "P4" && (
        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", priorityColor[task.priority])}>{task.priority}</span>
      )}

      {task.dueAt && (
        <span className={cn("shrink-0 text-xs text-muted-foreground", overdue && "text-destructive")}>{format(new Date(task.dueAt), "MMM d")}</span>
      )}
    </div>
  );
}
