import type { Request, Response } from "express";
import { Skill } from "./skill.model.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listSkillsHandler(req: Request, res: Response): Promise<void> {
  const skills = await Skill.find({ userId: req.userId }).sort({ category: 1, name: 1 });
  ok(res, { skills });
}

export async function createSkillHandler(req: Request, res: Response): Promise<void> {
  const skill = await Skill.create({ ...req.body, userId: req.userId });
  ok(res, { skill }, 201);
}

export async function updateSkillHandler(req: Request, res: Response): Promise<void> {
  const skill = await Skill.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!skill) throw AppError.notFound("Skill not found");
  const newlyEarned =
    skill.level === 5 ? await checkAchievementsForStat(req.userId as string, "skillsAtLevel5") : [];
  ok(res, { skill, newlyEarned });
}

export async function deleteSkillHandler(req: Request, res: Response): Promise<void> {
  const skill = await Skill.findOne({ _id: req.params.id, userId: req.userId });
  if (!skill) throw AppError.notFound("Skill not found");
  skill.deletedAt = new Date();
  await skill.save();
  ok(res, { deleted: true });
}

// Radar chart data: one point per skill, value = level (1-5).
export async function skillRadarHandler(req: Request, res: Response): Promise<void> {
  const skills = await Skill.find({ userId: req.userId }).select("name level category").sort({ name: 1 });
  ok(res, { radar: skills.map((s) => ({ name: s.name, level: s.level, category: s.category })) });
}
