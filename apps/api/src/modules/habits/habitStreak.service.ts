// WHAT: Habit streak calculation — the most intricate logic in the habits
// module, GENEROUSLY COMMENTED per CLAUDE.md (one of the four hotspots
// I'll tune later). Schedule-aware: "daily" and "weekdays" streaks count in
// day-sized steps; "perWeek" streaks count in week-sized steps.
//
// Shared policy across all schedule kinds: a "skip" (vacation mode, proposal
// #123) never breaks a streak, but also never grows it — it's a neutral day
// that's silently passed over. Only a *missing* log on a day the schedule
// actually requires something breaks the streak. "Today" is special-cased:
// if today has no log yet, that's not a break (the day isn't over), it's
// just not counted as a completed day either.
//
// All "what day is it" boundaries come from dateService.getLogicalDay, so
// a user with dayEndHour=3 checking in at 1am still has that count as
// "yesterday" — this file never does its own timezone math.
import { getLogicalDay } from "../../utils/dateService.js";
import type { HabitLogDoc } from "./habitLog.model.js";

export interface ScheduleLite {
  kind: "daily" | "perWeek" | "weekdays";
  timesPerWeek?: number | null;
  weekdays?: number[];
}

export interface HabitStreakResult {
  current: number;
}

const MAX_WALK_DAYS = 365 * 3; // safety cap, same rationale as learningStreak
const MAX_WALK_WEEKS = 260; // ~5 years

function dateKeyToUtcDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y as number, (m as number) - 1, d as number));
}

function utcDateToDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

// --- daily / weekdays: day-by-day walk ---

function computeDayBasedStreak(
  logsByDateKey: Map<string, HabitLogDoc["status"]>,
  todayDateKey: string,
  isRequiredDay: (date: Date) => boolean,
): HabitStreakResult {
  let current = 0;
  let cursor = dateKeyToUtcDate(todayDateKey);

  for (let i = 0; i < MAX_WALK_DAYS; i++) {
    const key = utcDateToDateKey(cursor);
    const required = isRequiredDay(cursor);

    if (required) {
      const status = logsByDateKey.get(key);
      if (status === "done") {
        current++;
      } else if (status === "skipped") {
        // preserved, not counted — fall through to step back a day
      } else if (i === 0) {
        // today, not logged yet — day isn't over, don't break
      } else {
        break; // missed a required day -> streak ends
      }
    }
    // non-required days (weekdays schedule, days outside the set) are
    // simply skipped over without affecting the streak either way.

    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { current };
}

// --- perWeek: week-by-week walk ---

function startOfWeek(date: Date, weekStartDay: number): Date {
  const result = new Date(date.getTime());
  const diff = (result.getUTCDay() - weekStartDay + 7) % 7;
  result.setUTCDate(result.getUTCDate() - diff);
  return result;
}

function computePerWeekStreak(
  logsByDateKey: Map<string, HabitLogDoc["status"]>,
  todayDateKey: string,
  weekStartDay: number,
  timesPerWeek: number,
): HabitStreakResult {
  let current = 0;
  const today = dateKeyToUtcDate(todayDateKey);
  let weekStart = startOfWeek(today, weekStartDay);

  for (let w = 0; w < MAX_WALK_WEEKS; w++) {
    let doneCount = 0;
    let skipCount = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart.getTime());
      day.setUTCDate(day.getUTCDate() + d);
      if (day > today) break; // don't look into the future within the current week
      const status = logsByDateKey.get(utcDateToDateKey(day));
      if (status === "done") doneCount++;
      else if (status === "skipped") skipCount++;
    }

    // Skips count toward satisfying the week (vacation mode shouldn't cost
    // you the week), but never substitute for every required check-in.
    const satisfied = doneCount + skipCount >= timesPerWeek;
    const isCurrentWeek = weekStart.getTime() === startOfWeek(today, weekStartDay).getTime();

    if (satisfied) {
      current++;
    } else if (isCurrentWeek) {
      // This week isn't over yet — not satisfied yet doesn't break anything.
    } else {
      break;
    }

    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  }

  return { current };
}

export function computeHabitStreak(
  schedule: ScheduleLite,
  logs: Pick<HabitLogDoc, "dateKey" | "status">[],
  timezone: string,
  dayEndHour: number,
  weekStartDay: number,
  now: Date = new Date(),
): HabitStreakResult {
  const { dateKey: todayDateKey } = getLogicalDay(timezone, dayEndHour, now);
  const logsByDateKey = new Map(logs.map((l) => [l.dateKey, l.status]));

  if (schedule.kind === "daily") {
    return computeDayBasedStreak(logsByDateKey, todayDateKey, () => true);
  }

  if (schedule.kind === "weekdays") {
    const allowed = new Set(schedule.weekdays ?? []);
    return computeDayBasedStreak(logsByDateKey, todayDateKey, (date) => allowed.has(date.getUTCDay()));
  }

  // perWeek
  return computePerWeekStreak(logsByDateKey, todayDateKey, weekStartDay, schedule.timesPerWeek ?? 1);
}
