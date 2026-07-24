export type GoalHorizon = "year" | "quarter" | "month";
export type GoalStatus = "active" | "archived";
export type TrafficLight = "on-track" | "at-risk" | "off-track";
export type KeyResultType = "number" | "percent" | "boolean";
export type BindingKind = "tasksCompletedInProject" | "habitCompletionRate" | "learningHours";

export interface KeyResultBinding {
  kind: BindingKind;
  refId: string;
  windowDays?: number;
}

export interface KeyResult {
  id: string;
  goalId: string;
  title: string;
  type: KeyResultType;
  startValue: number;
  targetValue: number;
  currentValue: number;
  binding: KeyResultBinding | null;
}

export interface Goal {
  id: string;
  horizon: GoalHorizon;
  title: string;
  theme?: string;
  status: GoalStatus;
  outcomeNote?: string;
  keyResults: KeyResult[];
  progress: number;
  trafficLight: TrafficLight;
}

export interface GoalCheckIn {
  id: string;
  goalId: string;
  keyResultId: string | null;
  value: number | null;
  reflection?: string;
  createdAt: string;
}
