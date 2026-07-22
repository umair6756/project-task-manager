import type { Request, Response } from "express";
import { UserGamification, UserAchievement, StreakFreezeToken } from "./userGamification.model.js";
import { computeLevel } from "./xp.service.js";
import { ACHIEVEMENTS } from "./achievement.catalog.js";
import { computeStat } from "./achievementStats.service.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { Habit } from "../habits/habit.model.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function meHandler(req: Request, res: Response): Promise<void> {
  const gamification = await UserGamification.findOne({ userId: req.userId });
  const levelInfo = computeLevel(gamification?.totalXp ?? 0);
  const earned = await UserAchievement.find({ userId: req.userId });
  const earnedKeys = new Set(earned.map((e) => e.achievementKey));

  // Group remaining locked achievements by statKey and only report current
  // progress for the *next* unearned tier in each — showing all 50 rows'
  // raw values on every request would be wasteful for what's essentially a
  // "what's next" progress list.
  const statKeys = [...new Set(ACHIEVEMENTS.map((a) => a.statKey))];
  const statValues = Object.fromEntries(
    await Promise.all(statKeys.map(async (key) => [key, await computeStat(req.userId as string, key)] as const)),
  );

  const achievements = ACHIEVEMENTS.map((def) => ({
    ...def,
    earned: earnedKeys.has(def.key),
    currentValue: statValues[def.statKey],
  }));

  const freezeTokens = await StreakFreezeToken.countDocuments({ userId: req.userId, spentAt: null });

  ok(res, { levelInfo, achievements, freezeTokensAvailable: freezeTokens });
}

// Spends the oldest unspent streak-freeze token to retroactively log a
// "skipped" (streak-preserving) day for a habit — reuses the same skip
// semantics habit.controller's skipHandler uses.
export async function spendStreakFreezeHandler(req: Request, res: Response): Promise<void> {
  const { habitId, dateKey: requestedDateKey } = req.body as { habitId: string; dateKey?: string };

  const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
  if (!habit) throw AppError.notFound("Habit not found");

  const token = await StreakFreezeToken.findOne({ userId: req.userId, spentAt: null }).sort({ earnedAt: 1 });
  if (!token) throw AppError.badRequest("No streak-freeze tokens available");

  let dateKey = requestedDateKey;
  if (!dateKey) {
    const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour");
    if (!user) throw AppError.notFound("User not found");
    dateKey = getLogicalDay(user.timezone, user.dayEndHour).dateKey;
  }

  await HabitLog.findOneAndUpdate(
    { habitId, dateKey },
    { $set: { userId: req.userId, status: "skipped", skipReason: "streak-freeze token" } },
    { upsert: true },
  );

  token.spentAt = new Date();
  token.spentOnHabitId = habit._id;
  token.spentOnDateKey = dateKey;
  await token.save();

  ok(res, { spent: true, dateKey });
}
