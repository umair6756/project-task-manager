import type { Request, Response } from "express";
import { Notification } from "./notification.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listNotificationsHandler(req: Request, res: Response): Promise<void> {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(100);
  ok(res, { notifications });
}

export async function markReadHandler(req: Request, res: Response): Promise<void> {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  if (!notification) throw AppError.notFound("Notification not found");
  ok(res, { notification });
}
