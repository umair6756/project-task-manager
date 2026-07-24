import type { TaskPriority } from "./types";

export const priorityColor: Record<TaskPriority, string> = {
  P1: "text-red-400 border-red-400/40",
  P2: "text-orange-400 border-orange-400/40",
  P3: "text-yellow-400 border-yellow-400/40",
  P4: "text-muted-foreground border-border",
};
