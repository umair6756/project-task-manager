import type { Request, Response } from "express";
import * as trashService from "./trash.service.js";
import { ok } from "../../utils/respond.js";

export async function listTrashHandler(req: Request, res: Response): Promise<void> {
  const items = await trashService.listTrash(req.userId as string);
  ok(res, { items });
}

export async function restoreTrashHandler(req: Request, res: Response): Promise<void> {
  await trashService.restoreTrashItem(req.params.model as string, req.params.id as string, req.userId as string);
  ok(res, { restored: true });
}

export async function purgeTrashHandler(req: Request, res: Response): Promise<void> {
  await trashService.purgeTrashItem(req.params.model as string, req.params.id as string, req.userId as string);
  ok(res, { purged: true });
}
