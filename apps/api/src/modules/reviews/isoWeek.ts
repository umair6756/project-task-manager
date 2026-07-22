// WHAT: Parses "YYYY-Www" (ISO 8601 week date, e.g. "2026-W10") into the
// UTC [start, end) range of that week (Monday 00:00 to next Monday 00:00).
export function isoWeekToDateRange(isoWeek: string): { start: Date; end: Date } {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) throw new Error(`Invalid ISO week: ${isoWeek}`);
  const year = Number(match[1]);
  const week = Number(match[2]);

  // ISO week 1 is the week containing the year's first Thursday.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const week1Monday = new Date(jan4.getTime() - (jan4Dow - 1) * 86400000);

  const start = new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
  const end = new Date(start.getTime() + 7 * 86400000);
  return { start, end };
}
