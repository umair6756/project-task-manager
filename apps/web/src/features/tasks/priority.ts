import type { TaskPriority } from "./types";

export const priorityColor: Record<TaskPriority, string> = {
  P1: "text-red-400 border-red-400/40",
  P2: "text-orange-400 border-orange-400/40",
  P3: "text-yellow-400 border-yellow-400/40",
  P4: "text-muted-foreground border-border",
};

// Solid fills, used for the left accent bar on rows/cards and the small status dot.
export const priorityBar: Record<TaskPriority, string> = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-yellow-500",
  P4: "bg-border",
};
