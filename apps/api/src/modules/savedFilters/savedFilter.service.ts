// WHAT: Translates a SavedFilter's structured query into a safe Mongo
// filter. WHY: CLAUDE.md explicitly calls out "translate to safe Mongo
// queries, never raw user queries" — this is the one function that builds
// the query object, so there's a single place to audit for injection risk.
import type { SavedFilterDoc } from "./savedFilter.model.js";

export function buildTaskFilter(userId: string, savedFilter: SavedFilterDoc): Record<string, unknown> {
  const filter: Record<string, unknown> = { userId };
  const q = savedFilter.query;

  if (q.status?.length) filter.status = { $in: q.status };
  if (q.priority?.length) filter.priority = { $in: q.priority };
  if (q.labels?.length) filter.labels = { $in: q.labels };
  if (q.projectId) filter.projectId = q.projectId;

  if (q.dueBefore || q.dueAfter) {
    const dueAt: Record<string, Date> = {};
    if (q.dueAfter) dueAt.$gte = q.dueAfter;
    if (q.dueBefore) dueAt.$lte = q.dueBefore;
    filter.dueAt = dueAt;
  }

  return filter;
}
