import type React from "react";
import { format, isPast } from "date-fns";
import { motion } from "framer-motion";
import { Check, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { priorityBar, priorityColor } from "./priority";
import { LabelChips } from "./LabelChips";
import { SubtaskProgress } from "./SubtaskProgress";
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
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group relative flex items-center gap-2 overflow-hidden rounded-md pl-3 pr-2 py-2 transition-colors hover:bg-accent/50",
        selected && "bg-accent/70",
      )}
    >
      <span className={cn("absolute inset-y-1 left-0 w-[3px] rounded-full", priorityBar[task.priority])} />

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

      <motion.button
        whileTap={{ scale: 0.8 }}
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
        {done && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
            <Check className="h-3 w-3" />
          </motion.span>
        )}
      </motion.button>

      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
        <span className={cn("truncate", done && "text-muted-foreground line-through")}>{task.title}</span>
        {task.subtasks.length > 0 && <SubtaskProgress subtasks={task.subtasks} />}
      </button>

      {task.labels.length > 0 && <LabelChips labelIds={task.labels} className="hidden shrink-0 gap-1 sm:flex" />}

      {task.priority !== "P4" && (
        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium", priorityColor[task.priority])}>{task.priority}</span>
      )}

      {task.dueAt && (
        <span className={cn("shrink-0 text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
          {format(new Date(task.dueAt), "MMM d")}
        </span>
      )}
    </motion.div>
  );
}
