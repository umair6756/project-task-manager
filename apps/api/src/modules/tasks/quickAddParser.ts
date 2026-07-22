// WHAT: Parses natural-language quick-add text ("pay bill tomorrow 5pm p1
// #home @renovation") into structured task fields. Pure function, no I/O —
// project/label *names* are resolved to ids by the caller (quickAdd
// controller), since that requires a DB lookup this function shouldn't own.
//
// Supported tokens (order-independent, case-insensitive):
//   - priority:  p1 p2 p3 p4
//   - labels:    #tag (repeatable)
//   - project:   @project name (takes the rest of a contiguous @-prefixed
//                run of words up until the next recognized token)
//   - date:      today, tomorrow, mon/tue/.../sun (next occurrence),
//                a "15 aug" / "aug 15" style day+month, or an ISO yyyy-mm-dd
//   - time:      5pm, 5:30pm, 17:00 — attaches to the date found (or today's
//                date, if a time is given with no explicit date)
//
// Whatever text is left after stripping recognized tokens becomes the title.
export interface QuickAddResult {
  title: string;
  priority: "P1" | "P2" | "P3" | "P4" | null;
  labelNames: string[];
  projectName: string | null;
  dueAt: Date | null;
}

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
];

function stripToken(text: string, regex: RegExp): { text: string; match: RegExpMatchArray | null } {
  const match = text.match(regex);
  if (!match) return { text, match: null };
  return { text: text.replace(regex, " "), match };
}

function parseTimeToken(text: string): { text: string; hour: number; minute: number } | null {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) ?? text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!match) return null;

  let hour: number;
  let minute = 0;
  if (match[3]) {
    // 12-hour form: "5pm", "5:30am"
    hour = Number(match[1]) % 12;
    minute = match[2] ? Number(match[2]) : 0;
    if (/pm/i.test(match[3])) hour += 12;
  } else {
    // 24-hour form: "17:00"
    hour = Number(match[1]);
    minute = Number(match[2]);
  }

  return { text: text.replace(match[0], " "), hour, minute };
}

function nextWeekday(from: Date, targetDow: number): Date {
  const result = new Date(from);
  const diff = (targetDow - result.getUTCDay() + 7) % 7 || 7; // always strictly in the future
  result.setUTCDate(result.getUTCDate() + diff);
  return result;
}

function parseDateToken(text: string, now: Date): { text: string; date: Date } | null {
  const lower = text.toLowerCase();

  if (/\btoday\b/.test(lower)) {
    return { text: text.replace(/today/i, " "), date: new Date(now) };
  }
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + 1);
    return { text: text.replace(/tomorrow/i, " "), date: d };
  }

  const weekdayMatch = lower.match(/\b(sun|mon|tue|wed|thu|fri|sat)\b/);
  if (weekdayMatch) {
    const dow = WEEKDAYS.indexOf(weekdayMatch[1] as string);
    return { text: text.replace(weekdayMatch[0], " "), date: nextWeekday(now, dow) };
  }

  // "15 aug" or "aug 15" (year defaults to current year, or next year if the
  // resulting date has already passed).
  const dayMonth = lower.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/);
  const monthDay = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})\b/);
  const found = dayMonth ?? monthDay;
  if (found) {
    const day = Number(dayMonth ? dayMonth[1] : monthDay![2]);
    const monthAbbr = dayMonth ? dayMonth[2] : monthDay![1];
    const month = MONTHS.indexOf(monthAbbr as string);
    let year = now.getUTCFullYear();
    let candidate = new Date(Date.UTC(year, month, day));
    if (candidate.getTime() < Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) {
      year += 1;
      candidate = new Date(Date.UTC(year, month, day));
    }
    return { text: text.replace(found[0], " "), date: candidate };
  }

  const isoMatch = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    const date = new Date(`${isoMatch[0]}T00:00:00.000Z`);
    return { text: text.replace(isoMatch[0], " "), date };
  }

  return null;
}

export function parseQuickAdd(input: string, now: Date = new Date()): QuickAddResult {
  let text = input;

  const priorityStrip = stripToken(text, /\bp([1-4])\b/i);
  text = priorityStrip.text;
  const priority = priorityStrip.match ? (`P${priorityStrip.match[1]}` as QuickAddResult["priority"]) : null;

  const labelNames: string[] = [];
  text = text.replace(/#(\S+)/g, (_m, tag: string) => {
    labelNames.push(tag);
    return " ";
  });

  // Project names are a single token (no spaces) — e.g. "@renovation". This
  // is a deliberate simplification of the brief's "@project (by name)":
  // multi-word project names would need a closing delimiter this compact
  // syntax doesn't have.
  let projectName: string | null = null;
  const projectMatch = text.match(/@(\S+)/);
  if (projectMatch) {
    projectName = projectMatch[1]!.trim();
    text = text.replace(projectMatch[0], " ");
  }

  const dateResult = parseDateToken(text, now);
  if (dateResult) text = dateResult.text;
  const timeResult = parseTimeToken(text);
  if (timeResult) text = timeResult.text;

  let dueAt: Date | null = null;
  if (dateResult || timeResult) {
    const base = dateResult ? dateResult.date : new Date(now);
    dueAt = new Date(base);
    if (timeResult) {
      dueAt.setUTCHours(timeResult.hour, timeResult.minute, 0, 0);
    } else {
      dueAt.setUTCHours(0, 0, 0, 0);
    }
  }

  const title = text.replace(/\s+/g, " ").trim();

  return { title, priority, labelNames, projectName, dueAt };
}
