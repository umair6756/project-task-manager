export type HabitScheduleKind = "daily" | "perWeek" | "weekdays";

export interface HabitSchedule {
  kind: HabitScheduleKind;
  timesPerWeek?: number | null;
  weekdays?: number[];
}

export interface Habit {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  type: "positive" | "negative";
  schedule: HabitSchedule;
  quantTarget: number | null;
  reminderTimes: string[];
  archived: boolean;
  currentStreak: number;
  bestStreak: number;
}

export interface Routine {
  id: string;
  name: string;
  timeOfDay?: string;
  habitIds: string[];
}

export interface RoutineRun {
  id: string;
  routineId: string;
  startedAt: string;
  completedAt: string | null;
}
