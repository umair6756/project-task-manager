import type { Request, Response } from "express";
import { exportUserData } from "./export.service.js";
import { importUserData } from "./import.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";
import type { ExportedData } from "./export.types.js";

export async function exportDataHandler(req: Request, res: Response): Promise<void> {
  const exported = await exportUserData(req.userId as string);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", 'attachment; filename="flowforge-export.json"');
  res.send(JSON.stringify(exported, null, 2));
}

export async function importDataHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as ExportedData;
  if (!body?.data || typeof body.data !== "object") {
    throw AppError.badRequest("Invalid import payload: missing data");
  }
  const result = await importUserData(req.userId as string, body);
  ok(res, result);
}
