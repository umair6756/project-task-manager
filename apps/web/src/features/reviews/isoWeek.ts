import { getISOWeek, getISOWeekYear } from "date-fns";

export function currentIsoWeek(date = new Date()): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
