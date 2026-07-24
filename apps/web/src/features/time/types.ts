export interface TimeEntry {
  id: string;
  taskId?: string | null;
  learningItemId?: string | null;
  start: string;
  end: string | null;
  source: "timer" | "manual" | "pomodoro";
  note?: string;
  billable?: boolean;
  hourlyRate?: number | null;
}

export interface PomodoroSession {
  id: string;
  taskId?: string | null;
  workLenMin: number;
  breakLenMin: number;
  cycles: number;
  currentCycle: number;
  startedAt: string;
  completedAt: string | null;
}
