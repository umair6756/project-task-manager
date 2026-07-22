import type { Request, Response } from "express";
import { Notebook } from "./notebook.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listNotebooksHandler(req: Request, res: Response): Promise<void> {
  const notebooks = await Notebook.find({ userId: req.userId }).sort({ sortOrder: 1 });
  ok(res, { notebooks });
}

export async function createNotebookHandler(req: Request, res: Response): Promise<void> {
  const notebook = await Notebook.create({ ...req.body, userId: req.userId });
  ok(res, { notebook }, 201);
}

export async function updateNotebookHandler(req: Request, res: Response): Promise<void> {
  const notebook = await Notebook.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!notebook) throw AppError.notFound("Notebook not found");
  ok(res, { notebook });
}

export async function deleteNotebookHandler(req: Request, res: Response): Promise<void> {
  const notebook = await Notebook.findOne({ _id: req.params.id, userId: req.userId });
  if (!notebook) throw AppError.notFound("Notebook not found");
  notebook.deletedAt = new Date();
  await notebook.save();
  ok(res, { deleted: true });
}
