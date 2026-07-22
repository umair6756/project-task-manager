import type { Request, Response } from "express";
import { SavedFilter } from "./savedFilter.model.js";
import { Task } from "../tasks/task.model.js";
import { buildTaskFilter } from "./savedFilter.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listSavedFiltersHandler(req: Request, res: Response): Promise<void> {
  const filters = await SavedFilter.find({ userId: req.userId }).sort({ pinned: -1, createdAt: -1 });
  ok(res, { filters });
}

export async function createSavedFilterHandler(req: Request, res: Response): Promise<void> {
  const filter = await SavedFilter.create({ ...req.body, userId: req.userId });
  ok(res, { filter }, 201);
}

export async function updateSavedFilterHandler(req: Request, res: Response): Promise<void> {
  const filter = await SavedFilter.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!filter) throw AppError.notFound("Saved filter not found");
  ok(res, { filter });
}

export async function deleteSavedFilterHandler(req: Request, res: Response): Promise<void> {
  const result = await SavedFilter.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw AppError.notFound("Saved filter not found");
  ok(res, { deleted: true });
}

export async function executeSavedFilterHandler(req: Request, res: Response): Promise<void> {
  const filter = await SavedFilter.findOne({ _id: req.params.id, userId: req.userId });
  if (!filter) throw AppError.notFound("Saved filter not found");
  const tasks = await Task.find(buildTaskFilter(req.userId as string, filter)).sort({ dueAt: 1 });
  ok(res, { tasks });
}
