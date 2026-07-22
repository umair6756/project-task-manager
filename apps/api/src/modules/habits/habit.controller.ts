import type { Request, Response } from "express";
import { Habit } from "./habit.model.js";
import { HabitLog } from "./habitLog.model.js";
import { computeHabitStreak } from "./habitStreak.service.js";
import { computeHabitStrength } from "./habitStrength.service.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";
import { checkAchievementsForStat, maybeAwardStreakFreezeToken } from "../gamification/achievementEngine.service.js";
import { triggerWebhooks } from "../platform/webhook.service.js";

async function findOwnedOr404(id: string, userId: string) {
  const habit = await Habit.findOne({ _id: id, userId });
  if (!habit) throw AppError.notFound("Habit not found");
  return habit;
}

async function getUserDaySettings(userId: string) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select("timezone dayEndHour weekStartDay");
  if (!user) throw AppError.notFound("User not found");
  return user;
}

// Recomputes + persists currentStreak/bestStreak after any log change —
// called by both check-in and skip so they never drift apart. Returns the
// previous/new streak so callers can react to streak-milestone crossings
// (e.g. awarding a streak-freeze token).
async function refreshStreak(habitId: string, userId: string): Promise<{ previous: number; current: number }> {
  const habit = await Habit.findById(habitId);
  if (!habit) return { previous: 0, current: 0 };
  const previous = habit.currentStreak;
  const user = await getUserDaySettings(userId);
  const logs = await HabitLog.find({ habitId }).select("dateKey status").lean();

  const { current } = computeHabitStreak(
    habit.schedule,
    logs,
    user.timezone,
    user.dayEndHour,
    user.weekStartDay,
  );
  habit.currentStreak = current;
  habit.bestStreak = Math.max(habit.bestStreak, current);
  await habit.save();
  return { previous, current };
}

export async function listHabitsHandler(req: Request, res: Response): Promise<void> {
  const { archived } = req.query as { archived?: string };
  const filter: Record<string, unknown> = { userId: req.userId };
  filter.archived = archived === "true";
  const habits = await Habit.find(filter).sort({ createdAt: 1 });
  ok(res, { habits });
}

export async function createHabitHandler(req: Request, res: Response): Promise<void> {
  const habit = await Habit.create({ ...req.body, userId: req.userId });
  ok(res, { habit }, 201);
}

export async function updateHabitHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  habit.set(req.body);
  await habit.save();
  ok(res, { habit });
}

export async function archiveHabitHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  habit.archived = true;
  await habit.save();
  ok(res, { habit });
}

export async function deleteHabitHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  habit.deletedAt = new Date();
  await habit.save();
  ok(res, { deleted: true });
}

// Idempotent per logical day: re-checking-in the same day just updates the
// existing log (upsert on the {habitId, dateKey} unique index).
export async function checkinHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  const user = await getUserDaySettings(req.userId as string);
  const { dateKey } = getLogicalDay(user.timezone, user.dayEndHour);
  const { value, note } = req.body as { value?: number; note?: string };

  await HabitLog.findOneAndUpdate(
    { habitId: habit._id, dateKey },
    { $set: { userId: req.userId, status: "done", value: value ?? null, note: note ?? "", skipReason: null } },
    { upsert: true, new: true },
  );

  const { previous, current } = await refreshStreak(String(habit._id), req.userId as string);
  const streakFreezeEarned = await maybeAwardStreakFreezeToken(req.userId as string, previous, current);
  const newlyEarned = await checkAchievementsForStat(req.userId as string, "habitCheckins");
  await triggerWebhooks(req.userId as string, "habit.done", { habitId: String(habit._id), name: habit.name });
  const refreshed = await Habit.findById(habit._id);
  ok(res, { habit: refreshed, streakFreezeEarned, newlyEarned });
}

export async function skipHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  const user = await getUserDaySettings(req.userId as string);
  const { dateKey } = getLogicalDay(user.timezone, user.dayEndHour);
  const { reason } = req.body as { reason?: string };

  await HabitLog.findOneAndUpdate(
    { habitId: habit._id, dateKey },
    { $set: { userId: req.userId, status: "skipped", skipReason: reason ?? "", value: null } },
    { upsert: true, new: true },
  );

  await refreshStreak(String(habit._id), req.userId as string);
  const refreshed = await Habit.findById(habit._id);
  ok(res, { habit: refreshed });
}

// GitHub-style year heatmap: one entry per logged day.
export async function heatmapHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);
  const sinceDateKey = since.toISOString().slice(0, 10);

  const logs = await HabitLog.find({ habitId: habit._id, dateKey: { $gte: sinceDateKey } })
    .select("dateKey status")
    .sort({ dateKey: 1 });
  ok(res, { heatmap: logs.map((l) => ({ date: l.dateKey, status: l.status })) });
}

// Completion-rate over the last N days: done / (done + missed-required-days).
// Skipped days are excluded from the denominator (neutral, per streak policy).
export async function completionRateHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceDateKey = since.toISOString().slice(0, 10);

  const logs = await HabitLog.find({ habitId: habit._id, dateKey: { $gte: sinceDateKey } })
    .select("status")
    .lean();
  const doneCount = logs.filter((l) => l.status === "done").length;
  const skippedCount = logs.filter((l) => l.status === "skipped").length;
  const consideredDays = days - skippedCount;
  const rate = consideredDays > 0 ? Math.round((doneCount / consideredDays) * 100) : 0;

  ok(res, { days, doneCount, skippedCount, rate });
}

export async function strengthHandler(req: Request, res: Response): Promise<void> {
  const habit = await findOwnedOr404(req.params.id as string, req.userId as string);
  const user = await getUserDaySettings(req.userId as string);
  const logs = await HabitLog.find({ habitId: habit._id }).select("dateKey status").lean();
  const strength = computeHabitStrength(habit.schedule, logs, user.timezone, user.dayEndHour);
  ok(res, { strength });
}
