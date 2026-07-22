// WHAT: Habit "strength score" — a 0-100 weighted-recency consistency
// score (proposal #134). GENEROUSLY COMMENTED (hotspot, tune here).
//
// FORMULA:
//   Look at the last WINDOW_DAYS (30) *required* days for this habit's
//   schedule (so a "weekdays: Mon/Wed/Fri" habit isn't penalized for
//   Tuesdays). Each required day gets a score:
//     done    -> 1.0
//     skipped -> 0.5   (neutral credit — doesn't hurt, doesn't fully help)
//     missing -> 0.0
//   Each day is weighted by DECAY^daysAgo (DECAY = 0.9), so today counts
//   full weight and a miss 30 days ago barely moves the needle. Today
//   itself is excluded if not yet logged (the day isn't over).
//   strength = round(100 * sum(weight*score) / sum(weight))
import type { HabitLogDoc } from "./habitLog.model.js";
import type { ScheduleLite } from "./habitStreak.service.js";
import { getLogicalDay } from "../../utils/dateService.js";

const WINDOW_DAYS = 30;
const DECAY = 0.9;

function dateKeyToUtcDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y as number, (m as number) - 1, d as number));
}
function utcDateToDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

export function computeHabitStrength(
  schedule: ScheduleLite,
  logs: Pick<HabitLogDoc, "dateKey" | "status">[],
  timezone: string,
  dayEndHour: number,
  now: Date = new Date(),
): number {
  const { dateKey: todayDateKey } = getLogicalDay(timezone, dayEndHour, now);
  const logsByDateKey = new Map(logs.map((l) => [l.dateKey, l.status]));
  const allowedWeekdays = schedule.kind === "weekdays" ? new Set(schedule.weekdays ?? []) : null;

  let weightedScore = 0;
  let weightTotal = 0;
  const today = dateKeyToUtcDate(todayDateKey);

  for (let i = 0; i < WINDOW_DAYS; i++) {
    const day = new Date(today.getTime());
    day.setUTCDate(day.getUTCDate() - i);

    if (allowedWeekdays && !allowedWeekdays.has(day.getUTCDay())) continue;

    const key = utcDateToDateKey(day);
    const status = logsByDateKey.get(key);
    if (i === 0 && !status) continue; // today, not logged yet — excluded, not penalized

    const score = status === "done" ? 1 : status === "skipped" ? 0.5 : 0;
    const weight = Math.pow(DECAY, i);
    weightedScore += weight * score;
    weightTotal += weight;
  }

  if (weightTotal === 0) return 0;
  return Math.round((weightedScore / weightTotal) * 100);
}
