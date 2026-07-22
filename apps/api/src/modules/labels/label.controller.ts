import type { Request, Response } from "express";
import { Label } from "./label.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listLabelsHandler(req: Request, res: Response): Promise<void> {
  const labels = await Label.find({ userId: req.userId }).sort({ name: 1 });
  ok(res, { labels });
}

export async function createLabelHandler(req: Request, res: Response): Promise<void> {
  const label = await Label.create({ ...req.body, userId: req.userId });
  ok(res, { label }, 201);
}

export async function updateLabelHandler(req: Request, res: Response): Promise<void> {
  const label = await Label.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!label) throw AppError.notFound("Label not found");
  ok(res, { label });
}

export async function deleteLabelHandler(req: Request, res: Response): Promise<void> {
  const label = await Label.findOne({ _id: req.params.id, userId: req.userId });
  if (!label) throw AppError.notFound("Label not found");
  label.deletedAt = new Date();
  await label.save();
  ok(res, { deleted: true });
}
