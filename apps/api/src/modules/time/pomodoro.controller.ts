import type { Request, Response } from "express";
import { PomodoroSession } from "./pomodoroSession.model.js";
import { TimeEntry } from "./timeEntry.model.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function startPomodoroHandler(req: Request, res: Response): Promise<void> {
  const session = await PomodoroSession.create({ ...req.body, userId: req.userId });
  ok(res, { session }, 201);
}

// Logs the just-finished work cycle as a TimeEntry and advances the
// session; marks completedAt once the last cycle is logged.
export async function completeCycleHandler(req: Request, res: Response): Promise<void> {
  const session = await PomodoroSession.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) throw AppError.notFound("Pomodoro session not found");
  if (session.completedAt) throw AppError.badRequest("Session already completed");

  const now = new Date();
  await TimeEntry.create({
    userId: req.userId,
    taskId: session.taskId,
    source: "pomodoro",
    start: new Date(now.getTime() - session.workLenMin * 60 * 1000),
    end: now,
    note: `Pomodoro cycle ${session.currentCycle}/${session.cycles}`,
  });

  let newlyEarned: Awaited<ReturnType<typeof checkAchievementsForStat>> = [];
  if (session.currentCycle >= session.cycles) {
    session.completedAt = now;
    newlyEarned = await checkAchievementsForStat(req.userId as string, "pomodorosCompleted");
  } else {
    session.currentCycle += 1;
  }
  await session.save();
  ok(res, { session, newlyEarned });
}

export async function stopPomodoroHandler(req: Request, res: Response): Promise<void> {
  const session = await PomodoroSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { completedAt: new Date() } },
    { new: true },
  );
  if (!session) throw AppError.notFound("Pomodoro session not found");
  ok(res, { session });
}
