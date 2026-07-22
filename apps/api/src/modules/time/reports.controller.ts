// WHAT: Time-tracking aggregations — always via Mongo aggregation
// pipelines (CLAUDE.md §3: "never fetch-all-and-loop").
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { TimeEntry } from "./timeEntry.model.js";
import { Task } from "../tasks/task.model.js";
import { Project } from "../projects/project.model.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

function durationExpr() {
  // Minutes between start and (end or now, for a still-running timer).
  return {
    $divide: [{ $subtract: [{ $ifNull: ["$end", "$$NOW"] }, "$start"] }, 60000],
  };
}

export async function timeByProjectHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from: Date; to: Date };
  const rows = await TimeEntry.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId), start: { $gte: from, $lte: to } } },
    {
      $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" },
    },
    { $unwind: { path: "$task", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$task.projectId", null] },
        minutes: { $sum: durationExpr() },
      },
    },
  ]);
  ok(res, { byProject: rows.map((r) => ({ projectId: r._id, minutes: Math.round(r.minutes) })) });
}

export async function timeByLabelHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from: Date; to: Date };
  const rows = await TimeEntry.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId), start: { $gte: from, $lte: to } } },
    { $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" } },
    { $unwind: { path: "$task", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$task.labels", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$task.labels", minutes: { $sum: durationExpr() } } },
  ]);
  ok(res, { byLabel: rows.map((r) => ({ labelId: r._id, minutes: Math.round(r.minutes) })) });
}

export async function timeByAreaHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from: Date; to: Date };
  const rows = await TimeEntry.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId), start: { $gte: from, $lte: to } } },
    { $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" } },
    { $unwind: { path: "$task", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "projects", localField: "task.projectId", foreignField: "_id", as: "project" } },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    { $group: { _id: { $ifNull: ["$project.areaId", null] }, minutes: { $sum: durationExpr() } } },
  ]);
  ok(res, { byArea: rows.map((r) => ({ areaId: r._id, minutes: Math.round(r.minutes) })) });
}

export async function dailyTimelineHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from: Date; to: Date };
  const entries = await TimeEntry.find({ userId: req.userId, start: { $gte: from, $lte: to } }).sort({ start: 1 });
  ok(res, { entries });
}

export async function estimatesVsActualsHandler(req: Request, res: Response): Promise<void> {
  const { projectId } = req.params as { projectId: string };
  const project = await Project.findOne({ _id: projectId, userId: req.userId });
  if (!project) throw AppError.notFound("Project not found");

  const [estimateAgg] = await Task.aggregate([
    { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: null, estimateMin: { $sum: { $ifNull: ["$estimateMin", 0] } } } },
  ]);

  const [actualAgg] = await TimeEntry.aggregate([
    { $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" } },
    { $unwind: "$task" },
    { $match: { "task.projectId": new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: null, actualMin: { $sum: durationExpr() } } },
  ]);

  ok(res, {
    estimateMin: estimateAgg?.estimateMin ?? 0,
    actualMin: Math.round(actualAgg?.actualMin ?? 0),
  });
}

// Weekly area budgets: user.settings.areaBudgets = { [areaId]: hoursPerWeek }.
export async function areaBudgetsHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("settings");
  if (!user) throw AppError.notFound("User not found");
  const budgets = (user.settings?.areaBudgets ?? {}) as Record<string, number>;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await TimeEntry.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId), start: { $gte: weekAgo } } },
    { $lookup: { from: "tasks", localField: "taskId", foreignField: "_id", as: "task" } },
    { $unwind: { path: "$task", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "projects", localField: "task.projectId", foreignField: "_id", as: "project" } },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$project.areaId", minutes: { $sum: durationExpr() } } },
  ]);
  const consumedByArea = new Map(rows.map((r) => [String(r._id), r.minutes / 60]));

  const budgetReport = Object.entries(budgets).map(([areaId, hoursBudget]) => {
    const consumedHours = consumedByArea.get(areaId) ?? 0;
    return {
      areaId,
      budgetHours: hoursBudget,
      consumedHours: Math.round(consumedHours * 10) / 10,
      consumedPercent: hoursBudget > 0 ? Math.round((consumedHours / hoursBudget) * 100) : 0,
    };
  });
  ok(res, { budgets: budgetReport });
}

// Deep-work heat: minutes tracked bucketed by hour-of-day (0-23), server-
// local UTC hour (matches how time entries are stored).
export async function deepWorkHeatHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from: Date; to: Date };
  const rows = await TimeEntry.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId), start: { $gte: from, $lte: to } } },
    { $group: { _id: { $hour: "$start" }, minutes: { $sum: durationExpr() } } },
    { $sort: { _id: 1 } },
  ]);
  const byHour = new Array(24).fill(0);
  for (const row of rows) byHour[row._id] = Math.round(row.minutes);
  ok(res, { byHour });
}
