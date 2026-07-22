// WHAT: Goal roll-up progress % and traffic-light status. Computed fresh on
// every read (not stored) so it can never go stale relative to its KRs.
//
// FORMULA:
//   Per-KR progress: number/percent -> clamp((current-start)/(target-start),
//   0,1)*100; boolean -> 100 if currentValue is truthy(>=1) else 0.
//   Goal roll-up progress = simple average of its KRs' progress (0 KRs -> 0).
//
//   Traffic light reuses the same "elapsed vs progress" heuristic as
//   projectHealth.service.ts: horizon implies a deadline (year=365d,
//   quarter=90d, month=30d from creation); compare elapsed-time ratio to
//   progress ratio with the same 10%/25% deficit thresholds.
import type { KeyResultDoc } from "./keyResult.model.js";
import type { GoalDoc } from "./goal.model.js";

const HORIZON_DAYS: Record<string, number> = { month: 30, quarter: 90, year: 365 };
const AT_RISK_THRESHOLD = 10;
const OFF_TRACK_THRESHOLD = 25;

export function computeKeyResultProgress(kr: Pick<KeyResultDoc, "type" | "startValue" | "targetValue" | "currentValue">): number {
  if (kr.type === "boolean") return kr.currentValue >= 1 ? 100 : 0;
  const span = kr.targetValue - kr.startValue;
  if (span === 0) return kr.currentValue >= kr.targetValue ? 100 : 0;
  const ratio = (kr.currentValue - kr.startValue) / span;
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}

export function computeGoalProgress(keyResults: Pick<KeyResultDoc, "type" | "startValue" | "targetValue" | "currentValue">[]): number {
  if (keyResults.length === 0) return 0;
  const total = keyResults.reduce((sum, kr) => sum + computeKeyResultProgress(kr), 0);
  return Math.round(total / keyResults.length);
}

export type TrafficLight = "on-track" | "at-risk" | "off-track";

export function computeGoalTrafficLight(goal: Pick<GoalDoc, "horizon" | "createdAt" | "status">, progress: number): TrafficLight {
  if (goal.status === "archived") return "on-track";

  const horizonDays = HORIZON_DAYS[goal.horizon] ?? 90;
  const deadline = new Date(goal.createdAt.getTime() + horizonDays * 24 * 60 * 60 * 1000);
  const now = Date.now();
  if (now > deadline.getTime() && progress < 100) return "off-track";

  const elapsedRatio = Math.min(1, Math.max(0, (now - goal.createdAt.getTime()) / (deadline.getTime() - goal.createdAt.getTime())));
  const expectedProgress = elapsedRatio * 100;
  const deficit = expectedProgress - progress;

  if (deficit <= AT_RISK_THRESHOLD) return "on-track";
  if (deficit <= OFF_TRACK_THRESHOLD) return "at-risk";
  return "off-track";
}
