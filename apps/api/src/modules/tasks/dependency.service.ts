// WHAT: Checks whether a task can be safely marked done given its
// dependsOn list (proposal #48 — "blocked-by; can't complete blocker
// warnings"). WHY: kept separate from the controller so both the single
// complete endpoint and future batch-complete can share the same check.
import { Task, type TaskDoc } from "./task.model.js";

export interface DependencyCheck {
  blocked: boolean;
  unfinishedDependencies: { id: string; title: string }[];
}

export async function checkDependencies(task: TaskDoc): Promise<DependencyCheck> {
  if (!task.dependsOn || task.dependsOn.length === 0) {
    return { blocked: false, unfinishedDependencies: [] };
  }
  const deps = await Task.find({ _id: { $in: task.dependsOn }, status: { $ne: "done" } })
    .select("title")
    .lean();
  return {
    blocked: deps.length > 0,
    unfinishedDependencies: deps.map((d) => ({ id: String(d._id), title: d.title as string })),
  };
}
