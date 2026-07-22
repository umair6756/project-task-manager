import type { Request, Response } from "express";
import { Note, type NoteDoc } from "./note.model.js";
import { NoteRevision } from "./noteRevision.model.js";
import { recordRevision } from "./noteRevision.service.js";
import { syncNoteLinks, getBacklinks, getNoteGraph } from "./wikiLink.service.js";
import { pushCheckboxesToTasks, renderCheckboxesFromTaskStatus } from "./checkboxTaskSync.service.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";

async function findOwnedOr404(id: string, userId: string): Promise<NoteDoc> {
  const note = await Note.findOne({ _id: id, userId });
  if (!note) throw AppError.notFound("Note not found");
  return note;
}

// Shared "save" path for create/update: runs checkbox->task sync (mutating
// content with injected markers) then wiki-link re-sync, then snapshots a
// revision. Centralized so create and update never drift apart.
async function persistNote(note: NoteDoc, userId: string): Promise<void> {
  const { content } = await pushCheckboxesToTasks(userId, String(note._id), note.content);
  note.content = content;
  await note.save();
  await syncNoteLinks(userId, String(note._id), note.content);
  await recordRevision(note);
}

export async function listNotesHandler(req: Request, res: Response): Promise<void> {
  const { notebookId, tag, favorited, pinned } = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = { userId: req.userId, isTemplate: false };
  if (notebookId) filter.notebookId = notebookId;
  if (tag) filter.tags = tag;
  if (favorited === "true") filter.favorited = true;
  if (pinned === "true") filter.pinned = true;

  const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
  ok(res, { notes });
}

export async function createNoteHandler(req: Request, res: Response): Promise<void> {
  const note = await Note.create({ ...req.body, userId: req.userId });
  await persistNote(note, req.userId as string);
  const newlyEarned = await checkAchievementsForStat(req.userId as string, "notesCreated");
  ok(res, { note, newlyEarned }, 201);
}

export async function getNoteHandler(req: Request, res: Response): Promise<void> {
  const note = await findOwnedOr404(req.params.id as string, req.userId as string);
  const renderedContent = await renderCheckboxesFromTaskStatus(req.userId as string, note.content);
  ok(res, { note: { ...note.toObject(), content: renderedContent } });
}

export async function updateNoteHandler(req: Request, res: Response): Promise<void> {
  const note = await findOwnedOr404(req.params.id as string, req.userId as string);
  note.set(req.body);
  await persistNote(note, req.userId as string);
  ok(res, { note });
}

export async function deleteNoteHandler(req: Request, res: Response): Promise<void> {
  const note = await findOwnedOr404(req.params.id as string, req.userId as string);
  note.deletedAt = new Date();
  await note.save();
  ok(res, { deleted: true });
}

export async function searchNotesHandler(req: Request, res: Response): Promise<void> {
  const { q } = req.query as { q: string };
  const results = await Note.find(
    { userId: req.userId, $text: { $search: q } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(50);

  // Simple snippet: first ~160 chars around the first match of any query
  // word, so the client gets *some* highlight context without needing a
  // full-text-search snippet extension.
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const withSnippets = results.map((note) => {
    const lower = note.content.toLowerCase();
    const idx = words.map((w) => lower.indexOf(w)).find((i) => i >= 0) ?? -1;
    const start = Math.max(0, idx - 60);
    const snippet = idx >= 0 ? note.content.slice(start, start + 160) : note.content.slice(0, 160);
    return { ...note.toObject(), snippet };
  });

  ok(res, { notes: withSnippets });
}

export async function getDailyNoteHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");
  const { dateKey } = getLogicalDay(user.timezone, user.dayEndHour);

  let note = await Note.findOne({ userId: req.userId, dailyDate: dateKey });
  if (!note) {
    note = await Note.create({ userId: req.userId, title: dateKey, content: "", dailyDate: dateKey });
  }
  ok(res, { note });
}

export async function getBacklinksHandler(req: Request, res: Response): Promise<void> {
  await findOwnedOr404(req.params.id as string, req.userId as string);
  const backlinks = await getBacklinks(req.params.id as string);
  ok(res, { backlinks });
}

export async function getGraphHandler(req: Request, res: Response): Promise<void> {
  const graph = await getNoteGraph(req.userId as string);
  ok(res, graph);
}

export async function listTemplatesHandler(req: Request, res: Response): Promise<void> {
  const templates = await Note.find({ userId: req.userId, isTemplate: true }).sort({ title: 1 });
  ok(res, { templates });
}

export async function saveAsTemplateHandler(req: Request, res: Response): Promise<void> {
  const source = await findOwnedOr404(req.params.id as string, req.userId as string);
  const template = await Note.create({
    userId: req.userId,
    title: `${source.title} (template)`,
    content: source.content,
    tags: source.tags,
    isTemplate: true,
  });
  ok(res, { template }, 201);
}

export async function createFromTemplateHandler(req: Request, res: Response): Promise<void> {
  const template = await Note.findOne({ _id: req.params.id, userId: req.userId, isTemplate: true });
  if (!template) throw AppError.notFound("Template not found");
  const note = await Note.create({
    userId: req.userId,
    notebookId: req.body.notebookId ?? null,
    title: req.body.title,
    content: template.content,
    tags: template.tags,
  });
  ok(res, { note }, 201);
}

export async function listRevisionsHandler(req: Request, res: Response): Promise<void> {
  await findOwnedOr404(req.params.id as string, req.userId as string);
  const revisions = await NoteRevision.find({ noteId: req.params.id }).sort({ createdAt: -1 });
  ok(res, { revisions });
}

export async function restoreRevisionHandler(req: Request, res: Response): Promise<void> {
  const note = await findOwnedOr404(req.params.id as string, req.userId as string);
  const revision = await NoteRevision.findOne({ _id: req.params.revisionId, noteId: note._id });
  if (!revision) throw AppError.notFound("Revision not found");
  note.title = revision.title;
  note.content = revision.content;
  await persistNote(note, req.userId as string);
  ok(res, { note });
}

export async function exportNoteHandler(req: Request, res: Response): Promise<void> {
  const note = await findOwnedOr404(req.params.id as string, req.userId as string);
  res.setHeader("Content-Type", "text/markdown");
  res.setHeader("Content-Disposition", `attachment; filename="${note.title}.md"`);
  res.send(note.content);
}
