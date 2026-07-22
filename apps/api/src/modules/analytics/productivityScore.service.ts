// WHAT: Daily productivity score (0-100) — a weighted blend of four
// signals. GENEROUSLY COMMENTED (hotspot — see CLAUDE.md's "Formula tuning"
// reusable prompt; this is one of the three named there alongside habit
// strength and SM-2).
//
// FORMULA:
//   tasksScore  = min(1, weightedTasksDone / TASKS_TARGET_POINTS)
//     weightedTasksDone = sum over tasks completed that day of
//       PRIORITY_WEIGHT[priority] (P1=4, P2=3, P3=2, P4=1) — finishing
//       high-priority work counts for more than clearing low-priority ones.
//   focusScore  = min(1, focusMinutes / FOCUS_TARGET_MIN)
//     focusMinutes = total tracked TimeEntry minutes that day.
//   habitScore  = doneHabits / scheduledHabits  (0 if none were scheduled)
//   mitScore    = completedMits / totalMits     (0 if none were set)
//
//   score = round(100 * (
//       0.35 * tasksScore +
//       0.30 * focusScore +
//       0.20 * habitScore +
//       0.15 * mitScore
//   ))
// All four weights sum to 1.0 by construction — keep it that way when
// tuning. Targets (TASKS_TARGET_POINTS, FOCUS_TARGET_MIN) are the "100%"
// bar for that signal; raise them to make a perfect score harder to reach.
import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { TimeEntry } from "../time/timeEntry.model.js";
import { Habit } from "../habits/habit.model.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { DailyPlan } from "../planning/dailyPlan.model.js";

const PRIORITY_WEIGHT: Record<string, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
const TASKS_TARGET_POINTS = 10;
const FOCUS_TARGET_MIN = 120;
const WEIGHTS = { tasks: 0.35, focus: 0.3, habits: 0.2, mits: 0.15 };

export interface ProductivityScoreBreakdown {
  score: number;
  tasksScore: number;
  focusScore: number;
  habitScore: number;
  mitScore: number;
}

export async function computeDailyProductivityScore(
  userId: string,
  dayStart: Date,
  dayEnd: Date,
): Promise<ProductivityScoreBreakdown> {
  const uid = new mongoose.Types.ObjectId(userId);

  const completedTasks = await Task.find({
    userId,
    completedAt: { $gte: dayStart, $lt: dayEnd },
  }).select("priority");
  const weightedTasksDone = completedTasks.reduce((sum, t) => sum + (PRIORITY_WEIGHT[t.priority] ?? 1), 0);
  const tasksScore = Math.min(1, weightedTasksDone / TASKS_TARGET_POINTS);

  const [{ minutes } = { minutes: 0 }] = await TimeEntry.aggregate([
    { $match: { userId: uid, start: { $gte: dayStart, $lt: dayEnd } } },
    {
      $group: {
        _id: null,
        minutes: { $sum: { $divide: [{ $subtract: [{ $ifNull: ["$end", "$$NOW"] }, "$start"] }, 60000] } },
      },
    },
  ]);
  const focusScore = Math.min(1, minutes / FOCUS_TARGET_MIN);

  const dateKey = dayStart.toISOString().slice(0, 10);
  const scheduledHabits = await Habit.countDocuments({ userId, archived: false });
  const doneHabitLogs = await HabitLog.countDocuments({ userId, dateKey, status: "done" });
  const habitScore = scheduledHabits > 0 ? Math.min(1, doneHabitLogs / scheduledHabits) : 0;

  const plan = await DailyPlan.findOne({ userId, dateKey });
  let mitScore = 0;
  if (plan && plan.mitTaskIds.length > 0) {
    const completedMits = await Task.countDocuments({
      _id: { $in: plan.mitTaskIds },
      status: "done",
    });
    mitScore = completedMits / plan.mitTaskIds.length;
  }

  const score = Math.round(
    100 *
      (WEIGHTS.tasks * tasksScore +
        WEIGHTS.focus * focusScore +
        WEIGHTS.habits * habitScore +
        WEIGHTS.mits * mitScore),
  );

  return { score, tasksScore, focusScore, habitScore, mitScore };
}
