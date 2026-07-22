import type { Request, Response } from "express";
import { Routine, RoutineRun } from "./routine.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listRoutinesHandler(req: Request, res: Response): Promise<void> {
  const routines = await Routine.find({ userId: req.userId }).sort({ timeOfDay: 1 });
  ok(res, { routines });
}

export async function createRoutineHandler(req: Request, res: Response): Promise<void> {
  const routine = await Routine.create({ ...req.body, userId: req.userId });
  ok(res, { routine }, 201);
}

export async function updateRoutineHandler(req: Request, res: Response): Promise<void> {
  const routine = await Routine.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!routine) throw AppError.notFound("Routine not found");
  ok(res, { routine });
}

export async function deleteRoutineHandler(req: Request, res: Response): Promise<void> {
  const routine = await Routine.findOne({ _id: req.params.id, userId: req.userId });
  if (!routine) throw AppError.notFound("Routine not found");
  routine.deletedAt = new Date();
  await routine.save();
  ok(res, { deleted: true });
}

export async function startRunHandler(req: Request, res: Response): Promise<void> {
  const routine = await Routine.findOne({ _id: req.params.id, userId: req.userId });
  if (!routine) throw AppError.notFound("Routine not found");
  const run = await RoutineRun.create({ userId: req.userId, routineId: routine._id });
  ok(res, { run }, 201);
}

export async function completeRunHandler(req: Request, res: Response): Promise<void> {
  const run = await RoutineRun.findOneAndUpdate(
    { _id: req.params.runId, userId: req.userId },
    { $set: { completedAt: new Date() } },
    { new: true },
  );
  if (!run) throw AppError.notFound("Routine run not found");
  ok(res, { run });
}
