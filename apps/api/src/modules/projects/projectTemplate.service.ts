// WHAT: Save-as-template + instantiate-with-date-shifting (proposal #25/26).
// WHY: designed now so Phase 3 only has to add "copy tasks too" to
// instantiate() — the anchor-date shifting math doesn't change.
import mongoose from "mongoose";
import { Project, type ProjectDoc } from "./project.model.js";
import { Milestone } from "./milestone.model.js";
import { AppError } from "../../utils/AppError.js";

export async function saveAsTemplate(projectId: string, userId: string): Promise<ProjectDoc> {
  const source = await Project.findOne({ _id: projectId, userId });
  if (!source) throw AppError.notFound("Project not found");

  const template = await Project.create({
    userId,
    areaId: source.areaId,
    name: `${source.name} (template)`,
    description: source.description,
    priority: source.priority,
    color: source.color,
    icon: source.icon,
    progressMode: source.progressMode,
    isTemplate: true,
    // Anchor is whatever the source project was scheduled against; if it had
    // no deadline, "now" is as good a zero-point as any for future shifting.
    templateAnchorDate: source.deadline ?? new Date(),
  });

  const milestones = await Milestone.find({ projectId: source._id });
  if (milestones.length > 0) {
    await Milestone.insertMany(
      milestones.map((m) => ({
        userId,
        projectId: template._id,
        title: m.title,
        dueDate: m.dueDate,
        done: false,
      })),
    );
  }

  return template;
}

export async function instantiateTemplate(
  templateId: string,
  userId: string,
  input: { name?: string; newStartDate: Date },
): Promise<ProjectDoc> {
  const template = await Project.findOne({ _id: templateId, userId, isTemplate: true });
  if (!template) throw AppError.notFound("Template not found");

  const anchor = template.templateAnchorDate ?? template.createdAt;
  const deltaMs = input.newStartDate.getTime() - anchor.getTime();
  const shift = (d: Date | null | undefined): Date | null =>
    d ? new Date(d.getTime() + deltaMs) : null;

  const project = await Project.create({
    userId,
    areaId: template.areaId,
    name: input.name ?? template.name.replace(/\s*\(template\)$/, ""),
    description: template.description,
    status: "active",
    priority: template.priority,
    deadline: shift(template.deadline),
    color: template.color,
    icon: template.icon,
    progressMode: template.progressMode,
    isTemplate: false,
  });

  const templateMilestones = await Milestone.find({ projectId: template._id });
  if (templateMilestones.length > 0) {
    await Milestone.insertMany(
      templateMilestones.map((m) => ({
        userId,
        projectId: project._id,
        title: m.title,
        dueDate: shift(m.dueDate),
        done: false,
      })),
    );
  }

  // Phase 3 hook: once Task exists, copy template tasks here the same way,
  // shifting dueAt/startAt by the same deltaMs.
  if (mongoose.modelNames().includes("Task")) {
    const Task = mongoose.model("Task");
    const templateTasks = await Task.find({ projectId: template._id });
    if (templateTasks.length > 0) {
      await Task.insertMany(
        templateTasks.map((t: Record<string, unknown>) => ({
          ...t,
          _id: undefined,
          userId,
          projectId: project._id,
          dueAt: shift(t.dueAt as Date | null),
          startAt: shift(t.startAt as Date | null),
        })),
      );
    }
  }

  return project;
}
