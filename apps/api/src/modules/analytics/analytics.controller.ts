import type { Request, Response } from "express";
import { DailyScore } from "./dailyScore.model.js";
import { computeDailyProductivityScore } from "./productivityScore.service.js";
import * as trends from "./trends.service.js";
import * as flow from "./projectFlow.service.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { Project } from "../projects/project.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

function parseRange(req: Request): { from: Date; to: Date } {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  return { from, to };
}

export async function todayScoreHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");
  const { startUtc, endUtc } = getLogicalDay(user.timezone, user.dayEndHour);
  const breakdown = await computeDailyProductivityScore(req.userId as string, startUtc, endUtc);
  ok(res, breakdown);
}

export async function scoreHistoryHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = parseRange(req);
  const scores = await DailyScore.find({
    userId: req.userId,
    dateKey: { $gte: from.toISOString().slice(0, 10), $lte: to.toISOString().slice(0, 10) },
  }).sort({ dateKey: 1 });
  ok(res, { scores });
}

export async function trendsHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = parseRange(req);
  const [velocity, rates, bestHours, procrastination, records] = await Promise.all([
    trends.velocity(req.userId as string, from, to),
    trends.completionRateAndOverdueRatio(req.userId as string, from, to),
    trends.bestHoursHistogram(req.userId as string, from, to),
    trends.procrastinationReport(req.userId as string, from, to),
    trends.personalRecords(req.userId as string),
  ]);
  ok(res, { velocity, ...rates, bestHours, procrastination, records });
}

export async function projectBurndownHandler(req: Request, res: Response): Promise<void> {
  const project = await Project.findOne({ _id: req.params.projectId, userId: req.userId });
  if (!project) throw AppError.notFound("Project not found");
  const { from, to } = parseRange(req);
  const burndown = await flow.projectBurndown(req.params.projectId as string, from, to);
  ok(res, { burndown });
}

export async function projectCfdHandler(req: Request, res: Response): Promise<void> {
  const project = await Project.findOne({ _id: req.params.projectId, userId: req.userId });
  if (!project) throw AppError.notFound("Project not found");
  const { from, to } = parseRange(req);
  const cfd = await flow.projectCumulativeFlow(req.params.projectId as string, from, to);
  ok(res, { cfd });
}
