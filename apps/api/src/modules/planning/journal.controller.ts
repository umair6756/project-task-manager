import type { Request, Response } from "express";
import { JournalEntry } from "./journalEntry.model.js";
import { computeMoodProductivityCorrelation } from "./moodCorrelation.service.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";

export async function listJournalEntriesHandler(req: Request, res: Response): Promise<void> {
  const entries = await JournalEntry.find({ userId: req.userId }).sort({ dateKey: -1 }).limit(365);
  ok(res, { entries });
}

// Upsert-by-day: journaling today twice updates the same entry.
export async function upsertTodayEntryHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");
  const { dateKey } = getLogicalDay(user.timezone, user.dayEndHour);

  const entry = await JournalEntry.findOneAndUpdate(
    { userId: req.userId, dateKey },
    { $set: { mood: req.body.mood, text: req.body.text ?? "" } },
    { upsert: true, new: true },
  );
  const newlyEarned = await checkAchievementsForStat(req.userId as string, "journalEntries");
  ok(res, { entry, newlyEarned });
}

export async function moodCorrelationHandler(req: Request, res: Response): Promise<void> {
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 90));
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceDateKey = since.toISOString().slice(0, 10);

  const result = await computeMoodProductivityCorrelation(req.userId as string, sinceDateKey);
  ok(res, result);
}
