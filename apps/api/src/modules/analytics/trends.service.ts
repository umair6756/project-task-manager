// WHAT: Trend aggregations for the analytics dashboard — velocity,
// completion rate, overdue ratio, best-hours histogram, procrastination
// report, personal records. All via aggregation pipelines.
import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { Habit } from "../habits/habit.model.js";
import { DailyScore } from "./dailyScore.model.js";

export async function velocity(userId: string, from: Date, to: Date) {
  const rows = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), completedAt: { $gte: from, $lt: to } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ date: r._id, completed: r.count }));
}

export async function completionRateAndOverdueRatio(userId: string, from: Date, to: Date) {
  const [created, completed, overdueOpen, totalOpen] = await Promise.all([
    Task.countDocuments({ userId, createdAt: { $gte: from, $lt: to } }),
    Task.countDocuments({ userId, completedAt: { $gte: from, $lt: to } }),
    Task.countDocuments({ userId, status: { $nin: ["done", "cancelled"] }, dueAt: { $lt: new Date() } }),
    Task.countDocuments({ userId, status: { $nin: ["done", "cancelled"] } }),
  ]);
  return {
    completionRate: created > 0 ? Math.round((completed / created) * 100) : 0,
    overdueRatio: totalOpen > 0 ? Math.round((overdueOpen / totalOpen) * 100) : 0,
  };
}

// "When do you complete most?" — histogram of completedAt hour-of-day.
export async function bestHoursHistogram(userId: string, from: Date, to: Date) {
  const rows = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), completedAt: { $gte: from, $lt: to } } },
    { $group: { _id: { $hour: "$completedAt" }, count: { $sum: 1 } } },
  ]);
  const byHour = new Array(24).fill(0);
  for (const row of rows) byHour[row._id] = row.count;
  return byHour;
}

// Average times-postponed, grouped by label and by project — "you've moved
// this 5x, split it?" territory (proposal #68/#190).
export async function procrastinationReport(userId: string, from: Date, to: Date) {
  const byProject = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), updatedAt: { $gte: from, $lt: to } } },
    { $group: { _id: "$projectId", avgPostpones: { $avg: "$postponeCount" }, count: { $sum: 1 } } },
    { $sort: { avgPostpones: -1 } },
  ]);
  const byLabel = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), updatedAt: { $gte: from, $lt: to } } },
    { $unwind: { path: "$labels", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$labels", avgPostpones: { $avg: "$postponeCount" }, count: { $sum: 1 } } },
    { $sort: { avgPostpones: -1 } },
  ]);
  return {
    byProject: byProject.map((r) => ({ projectId: r._id, avgPostpones: Math.round(r.avgPostpones * 10) / 10, count: r.count })),
    byLabel: byLabel.map((r) => ({ labelId: r._id, avgPostpones: Math.round(r.avgPostpones * 10) / 10, count: r.count })),
  };
}

export async function personalRecords(userId: string) {
  const [mostTasksDay] = await DailyScore.find({ userId }).sort({ tasksScore: -1 }).limit(1);
  const [mostCompletedByCount] = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), completedAt: { $ne: null } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  const [longestHabitStreak] = await Habit.find({ userId }).sort({ bestStreak: -1 }).limit(1);

  return {
    mostTasksCompletedInADay: mostCompletedByCount
      ? { date: mostCompletedByCount._id, count: mostCompletedByCount.count }
      : null,
    longestHabitStreak: longestHabitStreak
      ? { habitId: String(longestHabitStreak._id), name: longestHabitStreak.name, streak: longestHabitStreak.bestStreak }
      : null,
    bestProductivityDay: mostTasksDay ? { date: mostTasksDay.dateKey, score: mostTasksDay.score } : null,
  };
}
