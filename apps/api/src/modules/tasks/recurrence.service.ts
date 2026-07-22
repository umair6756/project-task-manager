// WHAT: Recurrence engine for tasks — a deliberately small RRULE subset
// (daily/weekly/monthly * interval, optional weekday set, end-by
// date/count), in two modes:
//   - "spawn":  the next occurrence is created only when the current one is
//               completed (completeRecurringTask below). Nothing exists
//               ahead of time; if you never complete today's task, tomorrow's
//               never appears. Good for "do the dishes" style tasks.
//   - "fixed":  occurrences exist on the calendar regardless of completion
//               (missing one doesn't shift the rest). materializeFixedOccurrences
//               is called by an hourly Agenda job (idempotent — see below)
//               that keeps the next 14 days populated. Good for "pay rent".
//
// Date math is done in UTC. This intentionally trades "preserve exact local
// wall-clock time across a DST transition" for simplicity/determinism —
// interval math (+1 day, +1 month) is done on UTC calendar fields, which is
// unambiguous and never produces an invalid/duplicate local time. The one
// piece of non-trivial logic is month-end clamping (Jan 31 + 1 month must
// land on Feb 28, not "invalid" or roll into March).
import { Task, type TaskDoc } from "./task.model.js";

export interface RecurrenceConfig {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  weekdays?: number[]; // 0=Sun..6=Sat, weekly only
  mode: "spawn" | "fixed";
  endDate?: Date | null;
  endAfterOccurrences?: number | null;
  occurrenceCount: number;
}

// Pure function: given the current occurrence's anchor date, what's the
// next one? Returns null if there is no next occurrence to compute from
// (freq is always set, so this only returns null for weekly-with-weekdays
// when, in principle, all weekdays are excluded — defensively guarded).
export function computeNextOccurrence(from: Date, recurrence: RecurrenceConfig): Date | null {
  const next = new Date(from.getTime());

  if (recurrence.freq === "daily") {
    next.setUTCDate(next.getUTCDate() + recurrence.interval);
    return next;
  }

  if (recurrence.freq === "weekly") {
    if (recurrence.weekdays && recurrence.weekdays.length > 0) {
      // Next matching weekday strictly after `from`, wrapping to next week's
      // set if we run off the end of this week. (interval > 1 combined with
      // an explicit weekday set is a documented limitation — the interval is
      // ignored in that combination, since "every 2 weeks on Mon/Fri" needs
      // a week-parity anchor this simple subset doesn't track.)
      const sorted = [...recurrence.weekdays].sort((a, b) => a - b);
      for (let i = 1; i <= 7; i++) {
        const candidate = new Date(from.getTime());
        candidate.setUTCDate(candidate.getUTCDate() + i);
        if (sorted.includes(candidate.getUTCDay())) return candidate;
      }
      return null;
    }
    next.setUTCDate(next.getUTCDate() + recurrence.interval * 7);
    return next;
  }

  // monthly: advance by `interval` months, clamping the day-of-month to the
  // target month's actual length (e.g. Jan 31 -> Feb 28/29, not Mar 3).
  const targetMonthIndex = from.getUTCMonth() + recurrence.interval;
  const targetYear = from.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(from.getUTCDate(), lastDayOfTargetMonth);
  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      clampedDay,
      from.getUTCHours(),
      from.getUTCMinutes(),
      from.getUTCSeconds(),
    ),
  );
}

function hasRecurrenceEnded(recurrence: RecurrenceConfig, nextOccurrenceCount: number, nextDate: Date | null): boolean {
  if (!nextDate) return true;
  if (recurrence.endDate && nextDate.getTime() > recurrence.endDate.getTime()) return true;
  if (recurrence.endAfterOccurrences && nextOccurrenceCount > recurrence.endAfterOccurrences) return true;
  return false;
}

// Called when a "spawn" mode recurring task is marked done: creates the
// next occurrence (a fresh Task carrying the same recurrence config) unless
// the series has ended. Returns the new task, or null if nothing was spawned.
export async function spawnNextOnComplete(completedTask: TaskDoc): Promise<TaskDoc | null> {
  const recurrence = completedTask.recurrence;
  if (!recurrence || recurrence.mode !== "spawn") return null;

  const anchor = completedTask.dueAt ?? completedTask.completedAt ?? new Date();
  const nextDate = computeNextOccurrence(anchor, recurrence);
  const nextCount = recurrence.occurrenceCount + 1;
  if (hasRecurrenceEnded(recurrence, nextCount, nextDate)) return null;

  const next = await Task.create({
    userId: completedTask.userId,
    projectId: completedTask.projectId,
    milestoneId: completedTask.milestoneId,
    title: completedTask.title,
    description: completedTask.description,
    priority: completedTask.priority,
    dueAt: nextDate,
    estimateMin: completedTask.estimateMin,
    labels: completedTask.labels,
    checklist: completedTask.checklist.map((c) => ({ text: c.text, done: false, sortOrder: c.sortOrder })),
    recurrence: { ...recurrence.toObject?.() ?? recurrence, occurrenceCount: nextCount },
    recurrenceParentId: completedTask.recurrenceParentId ?? completedTask._id,
  });
  return next;
}

// Called by the hourly Agenda job for every "fixed" mode recurring template
// task: materializes any missing occurrences in [now, now+14d]. Idempotent —
// re-running never double-creates, because it checks existing dueAt values
// for this template before inserting each candidate date.
export async function materializeFixedOccurrences(template: TaskDoc, horizonDays = 14): Promise<number> {
  const recurrence = template.recurrence;
  if (!recurrence || recurrence.mode !== "fixed") return 0;

  const horizon = new Date(Date.now() + horizonDays * 24 * 60 * 60 * 1000);
  const existing = await Task.find({
    recurrenceParentId: template._id,
    dueAt: { $ne: null },
  })
    .select("dueAt")
    .lean();
  const existingDates = new Set(existing.map((t) => (t.dueAt as Date).toISOString()));

  let cursor = template.dueAt ?? new Date();
  let occurrenceCount = recurrence.occurrenceCount;
  let created = 0;

  while (true) {
    const nextDate = computeNextOccurrence(cursor, recurrence);
    const nextCount = occurrenceCount + 1;
    if (hasRecurrenceEnded(recurrence, nextCount, nextDate) || !nextDate || nextDate > horizon) break;

    if (!existingDates.has(nextDate.toISOString())) {
      await Task.create({
        userId: template.userId,
        projectId: template.projectId,
        milestoneId: template.milestoneId,
        title: template.title,
        description: template.description,
        priority: template.priority,
        dueAt: nextDate,
        estimateMin: template.estimateMin,
        labels: template.labels,
        recurrenceParentId: template._id,
      });
      created++;
    }

    cursor = nextDate;
    occurrenceCount = nextCount;
  }

  if (occurrenceCount !== recurrence.occurrenceCount) {
    template.recurrence!.occurrenceCount = occurrenceCount;
    await template.save();
  }

  return created;
}
