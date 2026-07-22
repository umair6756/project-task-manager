import type { Request, Response } from "express";
import { Area } from "./area.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listAreasHandler(req: Request, res: Response): Promise<void> {
  const areas = await Area.find({ userId: req.userId }).sort({ sortOrder: 1, createdAt: 1 });
  ok(res, { areas });
}

export async function createAreaHandler(req: Request, res: Response): Promise<void> {
  const area = await Area.create({ ...req.body, userId: req.userId });
  ok(res, { area }, 201);
}

async function findOwnedOr404(id: string, userId: string) {
  const area = await Area.findOne({ _id: id, userId });
  if (!area) throw AppError.notFound("Area not found");
  return area;
}

export async function updateAreaHandler(req: Request, res: Response): Promise<void> {
  const area = await findOwnedOr404(req.params.id as string, req.userId as string);
  area.set(req.body);
  await area.save();
  ok(res, { area });
}

export async function deleteAreaHandler(req: Request, res: Response): Promise<void> {
  const area = await findOwnedOr404(req.params.id as string, req.userId as string);
  area.deletedAt = new Date();
  await area.save();
  ok(res, { deleted: true });
}

export async function reorderAreasHandler(req: Request, res: Response): Promise<void> {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await Promise.all(
    orderedIds.map((id, index) =>
      Area.updateOne({ _id: id, userId: req.userId }, { $set: { sortOrder: index } }),
    ),
  );
  const areas = await Area.find({ userId: req.userId }).sort({ sortOrder: 1 });
  ok(res, { areas });
}
