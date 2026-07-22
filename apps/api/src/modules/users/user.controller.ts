import type { Request, Response } from "express";
import { User } from "./user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOneAndUpdate(
    { _id: req.userId, deletedAt: null },
    { $set: req.body },
    { new: true },
  );
  if (!user) throw AppError.notFound("User not found");
  ok(res, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      weekStartDay: user.weekStartDay,
      dayEndHour: user.dayEndHour,
      avatarUrl: user.avatarUrl ?? null,
    },
  });
}

export async function uploadAvatarHandler(req: Request, res: Response): Promise<void> {
  if (!req.file) throw AppError.badRequest("No file uploaded");
  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findOneAndUpdate(
    { _id: req.userId, deletedAt: null },
    { $set: { avatarUrl } },
    { new: true },
  );
  if (!user) throw AppError.notFound("User not found");
  ok(res, { avatarUrl });
}

export async function getSettingsHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOne({ _id: req.userId, deletedAt: null });
  if (!user) throw AppError.notFound("User not found");
  ok(res, { settings: user.settings ?? {} });
}

export async function updateSettingsHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOneAndUpdate(
    { _id: req.userId, deletedAt: null },
    { $set: { settings: req.body } },
    { new: true },
  );
  if (!user) throw AppError.notFound("User not found");
  ok(res, { settings: user.settings ?? {} });
}
