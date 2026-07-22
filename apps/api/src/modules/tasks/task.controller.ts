import type { Request, Response } from "express";
import { Task } from "./task.model.js";
import { Label } from "../labels/label.model.js";
import { Project } from "../projects/project.model.js";
import { parseQuickAdd } from "./quickAddParser.js";
import { checkDependencies } from "./dependency.service.js";
import { spawnNextOnComplete } from "./recurrence.service.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";
import { triggerWebhooks } from "../platform/webhook.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

async function findOwnedOr404(id: string, userId: string) {
  const task = await Task.findOne({ _id: id, userId });
  if (!task) throw AppError.notFound("Task not found");
  return task;
}

export async function listTasksHandler(req: Request, res: Response): Promise<void> {
  const { status, priority, projectId, label } = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = { userId: req.userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (projectId) filter.projectId = projectId;
  if (label) filter.labels = label;

  const tasks = await Task.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  ok(res, { tasks });
}

export async function createTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await Task.create({
    ...req.body,
    userId: req.userId,
    activity: [{ action: "created" }],
  });
  ok(res, { task }, 201);
}

export async function getTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  ok(res, { task });
}

export async function updateTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  const before = { status: task.status, dueAt: task.dueAt };
  task.set(req.body);
  if (req.body.dueAt !== undefined && String(before.dueAt) !== String(task.dueAt)) {
    task.activity.push({ action: "rescheduled", detail: { from: before.dueAt, to: task.dueAt } });
    if (before.dueAt) task.postponeCount += 1;
  }
  await task.save();
  ok(res, { task });
}

export async function deleteTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  task.deletedAt = new Date();
  await task.save();
  ok(res, { deleted: true });
}

export async function completeTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  const { overrideDependencyWarning } = req.body as { overrideDependencyWarning?: boolean };

  const dependencyCheck = await checkDependencies(task);
  if (dependencyCheck.blocked && !overrideDependencyWarning) {
    ok(res, { warning: "BLOCKED_BY_INCOMPLETE_DEPENDENCIES", ...dependencyCheck }, 200);
    return;
  }

  task.status = "done";
  task.completedAt = new Date();
  task.activity.push({ action: "completed" });
  await task.save();

  const spawned = await spawnNextOnComplete(task);
  const newlyEarned = await checkAchievementsForStat(req.userId as string, "tasksCompleted");
  await triggerWebhooks(req.userId as string, "task.completed", { taskId: String(task._id), title: task.title });
  ok(res, { task, spawnedNext: spawned, newlyEarned });
}

export async function duplicateTaskHandler(req: Request, res: Response): Promise<void> {
  const source = await findOwnedOr404(req.params.id as string, req.userId as string);
  const copy = await Task.create({
    userId: req.userId,
    projectId: source.projectId,
    milestoneId: source.milestoneId,
    title: `${source.title} (copy)`,
    description: source.description,
    priority: source.priority,
    dueAt: source.dueAt,
    startAt: source.startAt,
    estimateMin: source.estimateMin,
    labels: source.labels,
    subtasks: source.subtasks.map((s) => ({ title: s.title, done: false, sortOrder: s.sortOrder })),
    checklist: source.checklist.map((c) => ({ text: c.text, done: false, sortOrder: c.sortOrder })),
    activity: [{ action: "created", detail: { duplicatedFrom: source._id } }],
  });
  ok(res, { task: copy }, 201);
}

export async function batchUpdateHandler(req: Request, res: Response): Promise<void> {
  const { ids, set } = req.body as {
    ids: string[];
    set: {
      status?: string;
      priority?: string;
      projectId?: string | null;
      dueAt?: Date | null;
      addLabels?: string[];
      removeLabels?: string[];
    };
  };

  const update: Record<string, unknown> = {};
  const addToSet: Record<string, unknown> = {};
  const pull: Record<string, unknown> = {};
  if (set.status) update.status = set.status;
  if (set.priority) update.priority = set.priority;
  if (set.projectId !== undefined) update.projectId = set.projectId;
  if (set.dueAt !== undefined) update.dueAt = set.dueAt;
  if (set.addLabels?.length) addToSet.labels = { $each: set.addLabels };
  if (set.removeLabels?.length) pull.labels = { $in: set.removeLabels };

  const mongoUpdate: Record<string, unknown> = {};
  if (Object.keys(update).length) mongoUpdate.$set = update;
  if (Object.keys(addToSet).length) mongoUpdate.$addToSet = addToSet;
  if (Object.keys(pull).length) mongoUpdate.$pull = pull;

  const result = await Task.updateMany({ _id: { $in: ids }, userId: req.userId }, mongoUpdate);
  ok(res, { matched: result.matchedCount, modified: result.modifiedCount });
}

export async function reorderTasksHandler(req: Request, res: Response): Promise<void> {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await Promise.all(
    orderedIds.map((id, index) =>
      Task.updateOne({ _id: id, userId: req.userId }, { $set: { sortOrder: index } }),
    ),
  );
  ok(res, { reordered: true });
}

export async function quickAddHandler(req: Request, res: Response): Promise<void> {
  const { text } = req.body as { text: string };
  const parsed = parseQuickAdd(text);

  const labelIds: string[] = [];
  for (const name of parsed.labelNames) {
    const label = await Label.findOneAndUpdate(
      { userId: req.userId, name },
      { $setOnInsert: { userId: req.userId, name } },
      { upsert: true, new: true },
    );
    labelIds.push(String(label._id));
  }

  let projectId: string | null = null;
  if (parsed.projectName) {
    const project = await Project.findOne({
      userId: req.userId,
      isTemplate: false,
      name: new RegExp(`^${parsed.projectName}$`, "i"),
    });
    projectId = project ? String(project._id) : null;
  }

  const task = await Task.create({
    userId: req.userId,
    title: parsed.title,
    priority: parsed.priority ?? "P4",
    dueAt: parsed.dueAt,
    labels: labelIds,
    projectId,
    activity: [{ action: "created", detail: { via: "quick-add" } }],
  });
  ok(res, { task, parsed }, 201);
}

// --- Comments ---

export async function addCommentHandler(req: Request, res: Response): Promise<void> {
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  task.comments.push({ text: req.body.text, createdAt: new Date() });
  await task.save();
  ok(res, { comments: task.comments }, 201);
}

// --- Reminders ---

export async function snoozeReminderHandler(req: Request, res: Response): Promise<void> {
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  const reminder = task.reminders.id(req.params.reminderId as string);
  if (!reminder) throw AppError.notFound("Reminder not found");
  reminder.snoozedUntil = new Date(req.body.snoozedUntil);
  await task.save();
  ok(res, { reminder });
}

// --- Attachments ---

export async function addAttachmentHandler(req: Request, res: Response): Promise<void> {
  if (!req.file) throw AppError.badRequest("No file uploaded");
  const task = await findOwnedOr404(req.params.id as string, req.userId as string);
  task.attachments.push({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.originalname,
    createdAt: new Date(),
  });
  await task.save();
  ok(res, { attachments: task.attachments }, 201);
}
