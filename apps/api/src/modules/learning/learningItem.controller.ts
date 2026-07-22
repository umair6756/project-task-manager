import type { Request, Response } from "express";
import mongoose from "mongoose";
import { LearningItem } from "./learningItem.model.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";
import { computeLearningStreak } from "./learningStreak.service.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

async function findOwnedOr404(id: string, userId: string) {
  const item = await LearningItem.findOne({ _id: id, userId });
  if (!item) throw AppError.notFound("Learning item not found");
  return item;
}

export async function listLearningItemsHandler(req: Request, res: Response): Promise<void> {
  const { status } = req.query as { status?: string };
  const filter: Record<string, unknown> = { userId: req.userId };
  if (status) filter.status = status;
  const items = await LearningItem.find(filter).sort({ updatedAt: -1 });
  ok(res, { items });
}

export async function createLearningItemHandler(req: Request, res: Response): Promise<void> {
  const item = await LearningItem.create({ ...req.body, userId: req.userId });
  ok(res, { item }, 201);
}

export async function getLearningItemHandler(req: Request, res: Response): Promise<void> {
  const item = await findOwnedOr404(req.params.id as string, req.userId as string);
  ok(res, { item });
}

export async function updateLearningItemHandler(req: Request, res: Response): Promise<void> {
  const item = await findOwnedOr404(req.params.id as string, req.userId as string);
  item.set(req.body);
  if (req.body.status === "completed" && !item.completedAt) item.completedAt = new Date();
  await item.save();
  ok(res, { item });
}

export async function deleteLearningItemHandler(req: Request, res: Response): Promise<void> {
  const item = await findOwnedOr404(req.params.id as string, req.userId as string);
  item.deletedAt = new Date();
  await item.save();
  ok(res, { deleted: true });
}

export async function updateProgressHandler(req: Request, res: Response): Promise<void> {
  const item = await findOwnedOr404(req.params.id as string, req.userId as string);
  const { value, note } = req.body as { value: number; note?: string };
  item.progressCurrent = value;
  item.progressHistory.push({ value, note: note ?? "", createdAt: new Date() });
  if (item.status === "wishlist") item.status = "learning";
  if (value >= item.progressTarget && item.progressTarget > 0) {
    item.status = "completed";
    item.completedAt = new Date();
  }
  await item.save();
  const newlyEarned =
    item.status === "completed" ? await checkAchievementsForStat(req.userId as string, "learningItemsCompleted") : [];
  ok(res, { item, newlyEarned });
}

export async function statsHandler(req: Request, res: Response): Promise<void> {
  const [byStatus, user] = await Promise.all([
    LearningItem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour"),
  ]);
  if (!user) throw AppError.notFound("User not found");

  const streak = await computeLearningStreak(req.userId as string, user.timezone, user.dayEndHour);
  ok(res, {
    itemsByStatus: Object.fromEntries(byStatus.map((b) => [b._id, b.count])),
    streak,
  });
}
