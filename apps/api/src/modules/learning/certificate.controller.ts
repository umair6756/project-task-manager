import type { Request, Response } from "express";
import { Certificate } from "./certificate.model.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listCertificatesHandler(req: Request, res: Response): Promise<void> {
  const certificates = await Certificate.find({ userId: req.userId }).sort({ expiresAt: 1 });
  ok(res, { certificates });
}

export async function createCertificateHandler(req: Request, res: Response): Promise<void> {
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const certificate = await Certificate.create({ ...req.body, fileUrl, userId: req.userId });
  const newlyEarned = await checkAchievementsForStat(req.userId as string, "certificatesEarned");
  ok(res, { certificate, newlyEarned }, 201);
}

export async function deleteCertificateHandler(req: Request, res: Response): Promise<void> {
  const certificate = await Certificate.findOne({ _id: req.params.id, userId: req.userId });
  if (!certificate) throw AppError.notFound("Certificate not found");
  certificate.deletedAt = new Date();
  await certificate.save();
  ok(res, { deleted: true });
}
