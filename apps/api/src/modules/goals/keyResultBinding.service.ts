// WHAT: Recomputes an auto-bound KeyResult's currentValue from its source
// (proposal #137). Run on-demand (after check-in) and hourly by an Agenda
// job so bound KRs stay fresh even if nothing else touches them.
//
// NOTE on "learningHours": Phase 7 (time tracking) hasn't shipped yet, so
// this binding approximates hours from the linked learning item's own
// progressCurrent when its progressUnit is "hours" — it does NOT yet sum
// real timeEntries. Revisit once Phase 7's timeEntries collection exists.
import { Task } from "../tasks/task.model.js";
import { Habit } from "../habits/habit.model.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { LearningItem } from "../learning/learningItem.model.js";
import type { KeyResultDoc } from "./keyResult.model.js";

export async function recomputeKeyResultBinding(kr: KeyResultDoc): Promise<number> {
  if (!kr.binding) return kr.currentValue;

  const { kind, refId, windowDays } = kr.binding;

  if (kind === "tasksCompletedInProject") {
    const count = await Task.countDocuments({ projectId: refId, status: "done" });
    kr.currentValue = count;
  } else if (kind === "habitCompletionRate") {
    const habit = await Habit.findById(refId);
    if (!habit) return kr.currentValue;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - windowDays);
    const sinceDateKey = since.toISOString().slice(0, 10);
    const logs = await HabitLog.find({ habitId: refId, dateKey: { $gte: sinceDateKey } }).select("status").lean();
    const doneCount = logs.filter((l) => l.status === "done").length;
    const skippedCount = logs.filter((l) => l.status === "skipped").length;
    const considered = windowDays - skippedCount;
    kr.currentValue = considered > 0 ? Math.round((doneCount / considered) * 100) : 0;
  } else if (kind === "learningHours") {
    const item = await LearningItem.findById(refId);
    kr.currentValue = item && item.progressUnit === "hours" ? item.progressCurrent : 0;
  }

  await kr.save();
  return kr.currentValue;
}
