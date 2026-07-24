export type TaskStatus = "todo" | "in-progress" | "blocked" | "done" | "cancelled";
export type TaskPriority = "P1" | "P2" | "P3" | "P4";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  sortOrder: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string | null;
  milestoneId?: string | null;
  dueAt?: string | null;
  startAt?: string | null;
  estimateMin?: number | null;
  labels: string[];
  dependsOn: string[];
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DependencyWarning {
  warning: "BLOCKED_BY_INCOMPLETE_DEPENDENCIES";
  blocked: true;
  unfinishedDependencies: { id: string; title: string }[];
}
