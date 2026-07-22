// WHAT: Project burndown + cumulative flow. NOTE on CFD: a true multi-
// status (todo/in-progress/blocked/done/cancelled) historical CFD needs a
// status-change log, which this app doesn't keep yet — this is a
// simplified two-state (open vs done) cumulative flow using createdAt/
// completedAt, which is exact for those two states. Revisit if a status-
// history collection gets added later.
import { Task } from "../tasks/task.model.js";

function eachDay(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export async function projectBurndown(projectId: string, from: Date, to: Date) {
  const tasks = await Task.find({ projectId }).select("createdAt completedAt").lean();
  return eachDay(from, to).map((day) => {
    const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const remaining = tasks.filter(
      (t) => t.createdAt < dayEnd && (!t.completedAt || t.completedAt >= dayEnd),
    ).length;
    return { date: day.toISOString().slice(0, 10), remaining };
  });
}

export async function projectCumulativeFlow(projectId: string, from: Date, to: Date) {
  const tasks = await Task.find({ projectId }).select("createdAt completedAt").lean();
  return eachDay(from, to).map((day) => {
    const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const existing = tasks.filter((t) => t.createdAt < dayEnd);
    const done = existing.filter((t) => t.completedAt && t.completedAt < dayEnd).length;
    const open = existing.length - done;
    return { date: day.toISOString().slice(0, 10), open, done };
  });
}
