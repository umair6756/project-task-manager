// WHAT: Shared Mongoose plugin giving any schema soft-delete + trash
// support. WHY: CLAUDE.md §1/§2 wants "soft-delete + trash (30d)" generic
// across models instead of hand-rolled per module.
//
// Adds `deletedAt: Date | null` and excludes deleted docs from every find/
// count query by default (via query middleware), unless the query explicitly
// opts in with `.setOptions({ withDeleted: true })`. Restoring just clears
// deletedAt; purge is a real `deleteOne`. A doc is only eligible for the
// generic trash listing/restore/purge endpoints if its model name is
// registered in TRASHABLE_MODELS below.
import type { Schema } from "mongoose";

const FIND_QUERY_MIDDLEWARE = [
  "find",
  "findOne",
  "findOneAndUpdate",
  "findOneAndDelete",
  "countDocuments",
  "count",
] as const;

export function softDeletePlugin(schema: Schema): void {
  schema.add({ deletedAt: { type: Date, default: null } });
  // TTL purge 30 days after soft-delete. Mongo's TTL monitor only removes
  // docs whose indexed field holds an actual Date — active docs (deletedAt:
  // null) are never touched by it.
  schema.index({ deletedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

  for (const op of FIND_QUERY_MIDDLEWARE) {
    schema.pre(op, function (this: { getOptions: () => Record<string, unknown>; getQuery: () => Record<string, unknown> }, next) {
      const options = this.getOptions();
      if (!options.withDeleted) {
        const query = this.getQuery();
        if (query.deletedAt === undefined) {
          this.getQuery().deletedAt = null;
        }
      }
      next();
    });
  }
}

// Registry of models the generic /trash endpoints operate over. Add a model
// name here when a new soft-deletable module ships.
export const TRASHABLE_MODELS = [
  "Area",
  "Project",
  "Label",
  "Task",
  "Note",
  "Notebook",
  "LearningItem",
  "Skill",
  "Certificate",
  "Deck",
  "Card",
  "Habit",
  "Routine",
  "Goal",
] as const;
export type TrashableModel = (typeof TRASHABLE_MODELS)[number];
