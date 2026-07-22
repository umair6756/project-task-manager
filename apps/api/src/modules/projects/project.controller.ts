import type { Request, Response } from "express";
import { Project, type ProjectDoc } from "./project.model.js";
import { Milestone } from "./milestone.model.js";
import { computeProjectProgress } from "./projectProgress.service.js";
import { computeProjectHealth } from "./projectHealth.service.js";
import { saveAsTemplate, instantiateTemplate } from "./projectTemplate.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";

async function serialize(project: ProjectDoc) {
  const progress = await computeProjectProgress(project);
  const health = computeProjectHealth(project.createdAt, project.deadline, progress, project.status);
  return { ...project.toObject(), progress, health };
}

async function findOwnedOr404(id: string, userId: string) {
  const project = await Project.findOne({ _id: id, userId });
  if (!project) throw AppError.notFound("Project not found");
  return project;
}

export async function listProjectsHandler(req: Request, res: Response): Promise<void> {
  const { status, areaId } = req.query as { status?: string; areaId?: string };
  const filter: Record<string, unknown> = { userId: req.userId, isTemplate: false };
  if (status) filter.status = status;
  if (areaId) filter.areaId = areaId;

  const projects = await Project.find(filter).sort({ pinned: -1, sortOrder: 1, createdAt: -1 });
  ok(res, { projects: await Promise.all(projects.map(serialize)) });
}

export async function listTemplatesHandler(req: Request, res: Response): Promise<void> {
  const templates = await Project.find({ userId: req.userId, isTemplate: true }).sort({ createdAt: -1 });
  ok(res, { templates });
}

export async function createProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await Project.create({ ...req.body, userId: req.userId });
  ok(res, { project: await serialize(project) }, 201);
}

export async function getProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await findOwnedOr404(req.params.id as string, req.userId as string);
  ok(res, { project: await serialize(project) });
}

export async function updateProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await findOwnedOr404(req.params.id as string, req.userId as string);
  project.set(req.body);
  await project.save();
  const newlyEarned =
    req.body.status === "done" ? await checkAchievementsForStat(req.userId as string, "projectsCompleted") : [];
  ok(res, { project: await serialize(project), newlyEarned });
}

export async function deleteProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await findOwnedOr404(req.params.id as string, req.userId as string);
  project.deletedAt = new Date();
  await project.save();
  ok(res, { deleted: true });
}

export async function archiveProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await findOwnedOr404(req.params.id as string, req.userId as string);
  project.statusBeforeArchive = project.status;
  project.status = "archived";
  await project.save();
  ok(res, { project: await serialize(project) });
}

export async function restoreProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await findOwnedOr404(req.params.id as string, req.userId as string);
  project.status = (project.statusBeforeArchive as ProjectDoc["status"]) ?? "active";
  project.statusBeforeArchive = null;
  await project.save();
  ok(res, { project: await serialize(project) });
}

export async function pinProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await findOwnedOr404(req.params.id as string, req.userId as string);
  project.pinned = !project.pinned;
  await project.save();
  ok(res, { project: await serialize(project) });
}

export async function saveTemplateHandler(req: Request, res: Response): Promise<void> {
  const template = await saveAsTemplate(req.params.id as string, req.userId as string);
  ok(res, { template }, 201);
}

export async function instantiateTemplateHandler(req: Request, res: Response): Promise<void> {
  const project = await instantiateTemplate(req.params.id as string, req.userId as string, req.body);
  ok(res, { project: await serialize(project) }, 201);
}

// --- Milestones ---

export async function listMilestonesHandler(req: Request, res: Response): Promise<void> {
  await findOwnedOr404(req.params.projectId as string, req.userId as string);
  const milestones = await Milestone.find({ projectId: req.params.projectId }).sort({ dueDate: 1 });
  ok(res, { milestones });
}

export async function createMilestoneHandler(req: Request, res: Response): Promise<void> {
  await findOwnedOr404(req.params.projectId as string, req.userId as string);
  const milestone = await Milestone.create({
    ...req.body,
    userId: req.userId,
    projectId: req.params.projectId,
  });
  ok(res, { milestone }, 201);
}

export async function updateMilestoneHandler(req: Request, res: Response): Promise<void> {
  const milestone = await Milestone.findOneAndUpdate(
    { _id: req.params.milestoneId, userId: req.userId, projectId: req.params.projectId },
    { $set: req.body },
    { new: true },
  );
  if (!milestone) throw AppError.notFound("Milestone not found");
  ok(res, { milestone });
}

export async function deleteMilestoneHandler(req: Request, res: Response): Promise<void> {
  const result = await Milestone.deleteOne({
    _id: req.params.milestoneId,
    userId: req.userId,
    projectId: req.params.projectId,
  });
  if (result.deletedCount === 0) throw AppError.notFound("Milestone not found");
  ok(res, { deleted: true });
}
