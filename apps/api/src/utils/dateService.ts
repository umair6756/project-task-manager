// WHAT: Centralizes every "what day is it, for this user" calculation
// (Today view, streaks, heatmaps). WHY: this is the #1 bug source called
// out in CLAUDE.md — timezone + custom day-end-hour ("day ends at 3am, not
// midnight") logic must live in exactly one place, generously commented,
// and be hammered with DST/edge-case tests. Everything else just calls
// getLogicalDay() and never touches `new Date()` day-boundary math itself.
//
// Core idea: a user's "logical day" doesn't have to start at 00:00 local
// time. If dayEndHour=3, then 2026-03-05's logical day runs from
// 2026-03-05T03:00 local to 2026-03-06T03:00 local — so a task completed at
// 1am is still "yesterday" for streak/today-view purposes. dayEndHour=0
// (the default) makes this behave like an ordinary midnight-to-midnight day.

interface WallClockParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

// Reads the wall-clock (local) date/time for `date` as observed in
// `timeZone`, e.g. the same instant is "14:00" in one zone and "09:00" in
// another — this extracts whichever one `timeZone` says.
function getWallClockParts(date: Date, timeZone: string): WallClockParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24, // Intl can format midnight as "24" with h23
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

// UTC-minus-local offset (in minutes) for the zone/instant pair: local wall
// clock = utcInstant + offsetMinutes. Computed by re-reading the same
// instant's wall clock in `timeZone` vs UTC and diffing — the standard
// technique when you don't have a timezone database library on hand.
function getOffsetMinutes(utcInstant: Date, timeZone: string): number {
  const local = getWallClockParts(utcInstant, timeZone);
  const asIfUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
  return Math.round((asIfUtc - utcInstant.getTime()) / 60000);
}

// Inverse of getWallClockParts: given a wall-clock time that should occur in
// `timeZone`, find the UTC instant it corresponds to. One offset-correction
// pass, which is exact except in the ~1hr window of a DST transition itself
// (acceptable here since we only ever feed this day-boundary hours, which
// are extremely unlikely to coincide with a transition instant down to the
// second).
function zonedTimeToUtc(parts: WallClockParts, timeZone: string): Date {
  const guessUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMinutes = getOffsetMinutes(new Date(guessUtcMs), timeZone);
  return new Date(guessUtcMs - offsetMinutes * 60000);
}

export interface LogicalDay {
  /** "YYYY-MM-DD" identifying the logical day, in the user's timezone. */
  dateKey: string;
  /** UTC instant the logical day begins (local dayEndHour:00:00). */
  startUtc: Date;
  /** UTC instant the logical day ends (next calendar day's dayEndHour:00:00). */
  endUtc: Date;
}

// The function everything else calls. `now` defaults to the current instant
// so tests can pin it. dayEndHour is [0-6]: hours before it still count as
// the previous logical day.
export function getLogicalDay(
  timeZone: string,
  dayEndHour: number,
  now: Date = new Date(),
): LogicalDay {
  const wall = getWallClockParts(now, timeZone);

  let calendarDateUtcMs = Date.UTC(wall.year, wall.month, wall.day); // month here is 1-based on purpose, see below
  // Date.UTC expects 0-based month; wall.month is 1-based, so subtract 1.
  calendarDateUtcMs = Date.UTC(wall.year, wall.month - 1, wall.day);
  if (wall.hour < dayEndHour) {
    calendarDateUtcMs -= 24 * 60 * 60 * 1000; // still "yesterday" before day-end hour
  }
  const calendarDate = new Date(calendarDateUtcMs);
  const y = calendarDate.getUTCFullYear();
  const m = calendarDate.getUTCMonth() + 1;
  const d = calendarDate.getUTCDate();

  const startUtc = zonedTimeToUtc({ year: y, month: m, day: d, hour: dayEndHour, minute: 0, second: 0 }, timeZone);
  const nextCalendarDate = new Date(calendarDateUtcMs + 24 * 60 * 60 * 1000);
  const endUtc = zonedTimeToUtc(
    {
      year: nextCalendarDate.getUTCFullYear(),
      month: nextCalendarDate.getUTCMonth() + 1,
      day: nextCalendarDate.getUTCDate(),
      hour: dayEndHour,
      minute: 0,
      second: 0,
    },
    timeZone,
  );

  const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return { dateKey, startUtc, endUtc };
}

// Convenience for "N logical days from now" (e.g. Upcoming ?days=7) — walks
// forward day by day rather than doing raw ms arithmetic, so it stays
// correct across DST transitions in the window.
export function getLogicalDayRange(
  timeZone: string,
  dayEndHour: number,
  days: number,
  now: Date = new Date(),
): { startUtc: Date; endUtc: Date } {
  const today = getLogicalDay(timeZone, dayEndHour, now);
  let endUtc = today.endUtc;
  for (let i = 1; i < days; i++) {
    // Step into the next logical day by asking again from just after the
    // previous boundary — cheap and DST-safe since each step re-derives
    // wall-clock parts from scratch.
    const next = getLogicalDay(timeZone, dayEndHour, new Date(endUtc.getTime() + 60 * 60 * 1000));
    endUtc = next.endUtc;
  }
  return { startUtc: today.startUtc, endUtc };
}
