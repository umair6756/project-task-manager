// WHAT: Builds the read-only aggregated data package for a weekly (or
// monthly/year) review — the server does the number-crunching, the client
// just renders the wizard (CLAUDE.md §1 module I / proposal #172).
import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { TimeEntry } from "../time/timeEntry.model.js";
import { Habit } from "../habits/habit.model.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { Goal } from "../goals/goal.model.js";
import { KeyResult } from "../goals/keyResult.model.js";
import { computeGoalProgress, computeGoalTrafficLight } from "../goals/goalProgress.service.js";

const REFLECTION_PROMPTS = [
  "What went well this period?",
  "What didn't go well?",
  "What's one lesson to carry forward?",
];

export async function buildReviewPackage(userId: string, start: Date, end: Date) {
  const uid = new mongoose.Types.ObjectId(userId);

  const [completedCount, completedByPriority, timeByArea, overdue, inboxCount, habits, goals] = await Promise.all([
    Task.countDocuments({ userId, completedAt: { $gte: start, $lt: end } }),
    Task.aggregate([
      { $match: { userId: uid, completedAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    TimeEntry.aggregate([
      { $match: { userId: uid, start: { $gte: start, $lt: end } } },
      { $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" } },
      { $unwind: { path: "$task", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "projects", localField: "task.projectId", foreignField: "_id", as: "project" } },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$project.areaId", null] },
          minutes: { $sum: { $divide: [{ $subtract: [{ $ifNull: ["$end", "$$NOW"] }, "$start"] }, 60000] } },
        },
      },
    ]),
    Task.find({ userId, status: { $nin: ["done", "cancelled"] }, dueAt: { $lt: new Date() } })
      .select("title dueAt priority")
      .sort({ dueAt: 1 })
      .limit(50),
    Task.countDocuments({ userId, status: { $nin: ["done", "cancelled"] }, projectId: null }),
    Habit.find({ userId, archived: false }),
    Goal.find({ userId, status: "active" }),
  ]);

  const startDateKey = start.toISOString().slice(0, 10);
  const habitRates = await Promise.all(
    habits.map(async (habit) => {
      const logs = await HabitLog.find({ habitId: habit._id, dateKey: { $gte: startDateKey } }).select("status").lean();
      const doneCount = logs.filter((l) => l.status === "done").length;
      const skippedCount = logs.filter((l) => l.status === "skipped").length;
      const windowDays = Math.round((end.getTime() - start.getTime()) / 86400000);
      const considered = windowDays - skippedCount;
      return {
        habitId: String(habit._id),
        name: habit.name,
        rate: considered > 0 ? Math.round((doneCount / considered) * 100) : 0,
      };
    }),
  );

  const goalStatuses = await Promise.all(
    goals.map(async (goal) => {
      const keyResults = await KeyResult.find({ goalId: goal._id });
      const progress = computeGoalProgress(keyResults);
      return {
        goalId: String(goal._id),
        title: goal.title,
        progress,
        trafficLight: computeGoalTrafficLight(goal, progress),
      };
    }),
  );

  return {
    completedStats: {
      total: completedCount,
      byPriority: Object.fromEntries(completedByPriority.map((r) => [r._id, r.count])),
    },
    timeByArea: timeByArea.map((r) => ({ areaId: r._id, minutes: Math.round(r.minutes) })),
    habitRates,
    overdue,
    inboxCount,
    goalStatuses,
    prompts: REFLECTION_PROMPTS,
  };
}
