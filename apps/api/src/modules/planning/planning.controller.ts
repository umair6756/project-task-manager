import type { Request, Response } from "express";
import { DailyPlan } from "./dailyPlan.model.js";
import { User } from "../users/user.model.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

async function getTodayDateKey(userId: string): Promise<string> {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");
  return getLogicalDay(user.timezone, user.dayEndHour).dateKey;
}

async function getOrCreateTodayPlan(userId: string): Promise<InstanceType<typeof DailyPlan>> {
  const dateKey = await getTodayDateKey(userId);
  let plan = await DailyPlan.findOne({ userId, dateKey });
  if (!plan) plan = await DailyPlan.create({ userId, dateKey });
  return plan;
}

export async function getDailyPlanHandler(req: Request, res: Response): Promise<void> {
  const plan = await getOrCreateTodayPlan(req.userId as string);
  ok(res, { plan });
}

export async function updatePlanNotesHandler(req: Request, res: Response): Promise<void> {
  const plan = await getOrCreateTodayPlan(req.userId as string);
  plan.planNotes = req.body.planNotes ?? plan.planNotes;
  await plan.save();
  ok(res, { plan });
}

// MITs: up to 3 task refs for today (proposal #170).
export async function setMitsHandler(req: Request, res: Response): Promise<void> {
  const { taskIds } = req.body as { taskIds: string[] };
  if (taskIds.length > 3) throw AppError.badRequest("At most 3 MITs allowed");
  const plan = await getOrCreateTodayPlan(req.userId as string);
  plan.mitTaskIds = taskIds as unknown as typeof plan.mitTaskIds;
  await plan.save();
  ok(res, { plan });
}

export async function shutdownHandler(req: Request, res: Response): Promise<void> {
  const { shutdownNotes, tomorrowNotes } = req.body as { shutdownNotes?: string; tomorrowNotes?: string };
  const plan = await getOrCreateTodayPlan(req.userId as string);
  plan.shutdownNotes = shutdownNotes ?? plan.shutdownNotes;
  plan.tomorrowNotes = tomorrowNotes ?? plan.tomorrowNotes;
  plan.shutdownDone = true;
  await plan.save();
  ok(res, { plan });
}
