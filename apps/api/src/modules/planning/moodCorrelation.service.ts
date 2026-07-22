// WHAT: Mood-vs-productivity correlation (proposal #176). Productivity
// isn't scored yet (that's Phase 8's productivityScore service) so this
// uses "tasks completed that day" as the proxy metric — swap the metric
// source here once Phase 8 ships without changing the math below.
//
// FORMULA: Pearson correlation coefficient r between the two paired series
// (mood_i, tasksCompleted_i) for every day that has a journal entry:
//   r = covariance(mood, tasks) / (stdDev(mood) * stdDev(tasks))
// r is in [-1, 1]; null when fewer than 2 paired days exist (undefined) or
// either series has zero variance (division by zero).
import { JournalEntry } from "./journalEntry.model.js";
import { Task } from "../tasks/task.model.js";

export interface CorrelationPoint {
  dateKey: string;
  mood: number;
  tasksCompleted: number;
}

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 2) return null;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - meanX;
    const dy = ys[i]! - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}

export async function computeMoodProductivityCorrelation(
  userId: string,
  sinceDateKey: string,
): Promise<{ points: CorrelationPoint[]; correlation: number | null }> {
  const entries = await JournalEntry.find({ userId, dateKey: { $gte: sinceDateKey } })
    .select("dateKey mood")
    .lean();
  if (entries.length === 0) return { points: [], correlation: null };

  const points: CorrelationPoint[] = [];
  for (const entry of entries) {
    const dayStart = new Date(`${entry.dateKey}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const tasksCompleted = await Task.countDocuments({
      userId,
      completedAt: { $gte: dayStart, $lt: dayEnd },
    });
    points.push({ dateKey: entry.dateKey, mood: entry.mood, tasksCompleted });
  }

  const correlation = pearson(points.map((p) => p.mood), points.map((p) => p.tasksCompleted));
  return { points, correlation };
}
