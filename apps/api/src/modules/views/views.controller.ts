// WHAT: Server-computed smart views (Today/Upcoming/Inbox/Anytime) —
// timezone + day-end-hour aware via dateService, so "Today" means the
// user's logical day, not a naive UTC midnight-to-midnight window.
import type { Request, Response } from "express";
import { Task } from "../tasks/task.model.js";
import { User } from "../users/user.model.js";
import { getLogicalDay, getLogicalDayRange } from "../../utils/dateService.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

const OPEN_STATUSES = { $nin: ["done", "cancelled"] };

async function getUserDaySettings(userId: string) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");
  return { timezone: user.timezone, dayEndHour: user.dayEndHour };
}

export async function todayViewHandler(req: Request, res: Response): Promise<void> {
  const { timezone, dayEndHour } = await getUserDaySettings(req.userId as string);
  const { startUtc, endUtc } = getLogicalDay(timezone, dayEndHour);

  const [overdue, dueToday, startingToday] = await Promise.all([
    Task.find({ userId: req.userId, status: OPEN_STATUSES, dueAt: { $lt: startUtc } }).sort({ dueAt: 1 }),
    Task.find({ userId: req.userId, status: OPEN_STATUSES, dueAt: { $gte: startUtc, $lt: endUtc } }).sort({ dueAt: 1 }),
    Task.find({
      userId: req.userId,
      status: OPEN_STATUSES,
      startAt: { $gte: startUtc, $lt: endUtc },
      dueAt: null,
    }).sort({ startAt: 1 }),
  ]);

  ok(res, { overdue, dueToday, startingToday });
}

export async function upcomingViewHandler(req: Request, res: Response): Promise<void> {
  const { timezone, dayEndHour } = await getUserDaySettings(req.userId as string);
  const days = Math.min(30, Math.max(1, Number(req.query.days) || 7));
  const { startUtc, endUtc } = getLogicalDayRange(timezone, dayEndHour, days);

  const tasks = await Task.find({
    userId: req.userId,
    status: OPEN_STATUSES,
    dueAt: { $gte: startUtc, $lt: endUtc },
  }).sort({ dueAt: 1 });

  ok(res, { tasks, rangeDays: days });
}

export async function inboxViewHandler(req: Request, res: Response): Promise<void> {
  const tasks = await Task.find({
    userId: req.userId,
    status: OPEN_STATUSES,
    projectId: null,
  }).sort({ createdAt: -1 });
  ok(res, { tasks });
}

export async function anytimeViewHandler(req: Request, res: Response): Promise<void> {
  const tasks = await Task.find({
    userId: req.userId,
    status: OPEN_STATUSES,
    dueAt: null,
    startAt: null,
  }).sort({ sortOrder: 1, createdAt: -1 });
  ok(res, { tasks });
}
