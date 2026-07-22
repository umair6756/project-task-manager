// WHAT: Global search across tasks/notes/projects/learning items — parallel
// text queries, merged and ranked by each engine's own textScore (proposal
// #6). Simple, since Mongo doesn't let you $text-search across collections
// in one query.
import type { Request, Response } from "express";
import { Task } from "../tasks/task.model.js";
import { Note } from "../notes/note.model.js";
import { Project } from "../projects/project.model.js";
import { LearningItem } from "../learning/learningItem.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

interface SearchResult {
  type: "task" | "note" | "project" | "learningItem";
  id: string;
  title: string;
  score: number;
}

export async function globalSearchHandler(req: Request, res: Response): Promise<void> {
  const q = req.query.q as string | undefined;
  if (!q) throw AppError.badRequest("Missing query parameter q");

  const [tasks, notes, projects, learningItems] = await Promise.all([
    Task.find(
      { userId: req.userId, title: new RegExp(escapeRegex(q), "i") },
      { title: 1 },
    ).limit(20),
    Note.find({ userId: req.userId, $text: { $search: q } }, { title: 1, score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(20),
    Project.find({ userId: req.userId, name: new RegExp(escapeRegex(q), "i") }, { name: 1 }).limit(20),
    LearningItem.find({ userId: req.userId, title: new RegExp(escapeRegex(q), "i") }, { title: 1 }).limit(20),
  ]);

  const results: SearchResult[] = [
    ...tasks.map((t) => ({ type: "task" as const, id: String(t._id), title: t.title, score: 1 })),
    ...notes.map((n) => ({
      type: "note" as const,
      id: String(n._id),
      title: n.title,
      score: (n as unknown as { score?: number }).score ?? 1,
    })),
    ...projects.map((p) => ({ type: "project" as const, id: String(p._id), title: p.name, score: 1 })),
    ...learningItems.map((l) => ({ type: "learningItem" as const, id: String(l._id), title: l.title, score: 1 })),
  ];

  results.sort((a, b) => b.score - a.score);
  ok(res, { results });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
