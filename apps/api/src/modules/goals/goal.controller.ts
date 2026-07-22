import type { Request, Response } from "express";
import { Goal, type GoalDoc } from "./goal.model.js";
import { KeyResult, type KeyResultDoc } from "./keyResult.model.js";
import { CheckIn } from "./checkIn.model.js";
import { computeGoalProgress, computeGoalTrafficLight } from "./goalProgress.service.js";
import { recomputeKeyResultBinding } from "./keyResultBinding.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";

async function findOwnedOr404(id: string, userId: string): Promise<GoalDoc> {
  const goal = await Goal.findOne({ _id: id, userId });
  if (!goal) throw AppError.notFound("Goal not found");
  return goal;
}

async function serialize(goal: GoalDoc) {
  const keyResults = await KeyResult.find({ goalId: goal._id });
  const progress = computeGoalProgress(keyResults);
  const trafficLight = computeGoalTrafficLight(goal, progress);
  return { ...goal.toObject(), keyResults, progress, trafficLight };
}

export async function listGoalsHandler(req: Request, res: Response): Promise<void> {
  const { horizon, status } = req.query as { horizon?: string; status?: string };
  const filter: Record<string, unknown> = { userId: req.userId };
  if (horizon) filter.horizon = horizon;
  if (status) filter.status = status;
  const goals = await Goal.find(filter).sort({ createdAt: -1 });
  ok(res, { goals: await Promise.all(goals.map(serialize)) });
}

export async function createGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await Goal.create({ ...req.body, userId: req.userId });
  ok(res, { goal: await serialize(goal) }, 201);
}

export async function getGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await findOwnedOr404(req.params.id as string, req.userId as string);
  ok(res, { goal: await serialize(goal) });
}

export async function updateGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await findOwnedOr404(req.params.id as string, req.userId as string);
  goal.set(req.body);
  await goal.save();
  ok(res, { goal: await serialize(goal) });
}

export async function archiveGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await findOwnedOr404(req.params.id as string, req.userId as string);
  goal.status = "archived";
  goal.outcomeNote = req.body.outcomeNote ?? "";
  await goal.save();
  const newlyEarned = await checkAchievementsForStat(req.userId as string, "goalsCompleted");
  ok(res, { goal: await serialize(goal), newlyEarned });
}

export async function deleteGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await findOwnedOr404(req.params.id as string, req.userId as string);
  goal.deletedAt = new Date();
  await goal.save();
  ok(res, { deleted: true });
}

// --- Key results ---

async function findKeyResultOr404(goalId: string, keyResultId: string, userId: string): Promise<KeyResultDoc> {
  await findOwnedOr404(goalId, userId);
  const kr = await KeyResult.findOne({ _id: keyResultId, goalId, userId });
  if (!kr) throw AppError.notFound("Key result not found");
  return kr;
}

export async function createKeyResultHandler(req: Request, res: Response): Promise<void> {
  await findOwnedOr404(req.params.goalId as string, req.userId as string);
  const kr = await KeyResult.create({ ...req.body, userId: req.userId, goalId: req.params.goalId });
  if (kr.binding) await recomputeKeyResultBinding(kr);
  ok(res, { keyResult: kr }, 201);
}

export async function updateKeyResultHandler(req: Request, res: Response): Promise<void> {
  const kr = await findKeyResultOr404(req.params.goalId as string, req.params.keyResultId as string, req.userId as string);
  kr.set(req.body);
  await kr.save();
  ok(res, { keyResult: kr });
}

export async function deleteKeyResultHandler(req: Request, res: Response): Promise<void> {
  await findKeyResultOr404(req.params.goalId as string, req.params.keyResultId as string, req.userId as string);
  await KeyResult.deleteOne({ _id: req.params.keyResultId });
  ok(res, { deleted: true });
}

// --- Check-ins ---

export async function createCheckInHandler(req: Request, res: Response): Promise<void> {
  const goal = await findOwnedOr404(req.params.goalId as string, req.userId as string);
  const { keyResultId, value, reflection } = req.body as { keyResultId?: string | null; value?: number | null; reflection?: string };

  if (keyResultId && value !== undefined && value !== null) {
    const kr = await KeyResult.findOne({ _id: keyResultId, goalId: goal._id });
    if (!kr) throw AppError.notFound("Key result not found");
    kr.currentValue = value;
    await kr.save();
  }

  const checkIn = await CheckIn.create({
    userId: req.userId,
    goalId: goal._id,
    keyResultId: keyResultId ?? null,
    value: value ?? null,
    reflection: reflection ?? "",
  });
  ok(res, { checkIn }, 201);
}

export async function listCheckInsHandler(req: Request, res: Response): Promise<void> {
  await findOwnedOr404(req.params.goalId as string, req.userId as string);
  const checkIns = await CheckIn.find({ goalId: req.params.goalId }).sort({ createdAt: -1 });
  ok(res, { checkIns });
}
