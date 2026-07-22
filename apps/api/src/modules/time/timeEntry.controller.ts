import type { Request, Response } from "express";
import { TimeEntry } from "./timeEntry.model.js";
import * as timeEntryService from "./timeEntry.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function getRunningTimerHandler(req: Request, res: Response): Promise<void> {
  const running = await timeEntryService.getRunningTimer(req.userId as string);
  ok(res, { running });
}

export async function startTimerHandler(req: Request, res: Response): Promise<void> {
  const entry = await timeEntryService.startTimer(req.userId as string, req.body);
  ok(res, { entry }, 201);
}

export async function stopTimerHandler(req: Request, res: Response): Promise<void> {
  const entry = await timeEntryService.stopTimer(req.userId as string);
  ok(res, { entry });
}

export async function listEntriesHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from?: string; to?: string };
  const filter: Record<string, unknown> = { userId: req.userId };
  if (from || to) {
    filter.start = {};
    if (from) (filter.start as Record<string, Date>).$gte = new Date(from);
    if (to) (filter.start as Record<string, Date>).$lte = new Date(to);
  }
  const entries = await TimeEntry.find(filter).sort({ start: -1 });
  ok(res, { entries });
}

export async function createManualEntryHandler(req: Request, res: Response): Promise<void> {
  const { start, end } = req.body as { start: Date; end: Date };
  if (end <= start) throw AppError.badRequest("end must be after start");
  await timeEntryService.assertNoOverlap(req.userId as string, start, end);
  const entry = await TimeEntry.create({ ...req.body, userId: req.userId, source: "manual" });
  ok(res, { entry }, 201);
}

export async function updateManualEntryHandler(req: Request, res: Response): Promise<void> {
  const entry = await TimeEntry.findOne({ _id: req.params.id, userId: req.userId });
  if (!entry) throw AppError.notFound("Time entry not found");

  const nextStart = req.body.start ?? entry.start;
  const nextEnd = req.body.end ?? entry.end;
  if (nextEnd && nextEnd <= nextStart) throw AppError.badRequest("end must be after start");
  if (nextEnd) {
    await timeEntryService.assertNoOverlap(req.userId as string, nextStart, nextEnd, String(entry._id));
  }

  entry.set(req.body);
  await entry.save();
  ok(res, { entry });
}

export async function deleteEntryHandler(req: Request, res: Response): Promise<void> {
  const result = await TimeEntry.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw AppError.notFound("Time entry not found");
  ok(res, { deleted: true });
}
