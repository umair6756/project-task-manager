import type { NextFunction, Request, Response } from "express";
import { ActivityLog } from "../modules/activity/activityLog.model.js";
import { logger } from "../config/logger.js";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

// WHAT: Records every mutating, authenticated request after it finishes.
// WHY: powers the activity-log feature; fire-and-forget so it never slows
// down or breaks the actual response.
export function activityLogger(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    if (!MUTATING_METHODS.has(req.method) || !req.userId) return;
    const entityType = req.path.split("/").filter(Boolean)[0];
    ActivityLog.create({
      userId: req.userId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      entityType,
    }).catch((err) => logger.warn({ err }, "activity log write failed"));
  });
  next();
}
