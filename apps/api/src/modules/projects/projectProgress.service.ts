// WHAT: Computes a project's completion percentage.
// WHY: "auto" mode is done-tasks / total-tasks, but the Task model doesn't
// exist until Phase 3 — this stub returns manualProgress-or-0 for auto mode
// today and gets its real aggregation swapped in once tasks ship, without
// callers changing.
import mongoose from "mongoose";
import type { ProjectDoc } from "./project.model.js";

export async function computeProjectProgress(project: ProjectDoc): Promise<number> {
  if (project.progressMode === "manual") {
    return project.manualProgress;
  }

  // Auto mode: % of the project's tasks that are done. Guarded with a
  // runtime model lookup so this compiles and runs before Phase 3 adds the
  // Task collection; once it exists, this branch takes over automatically.
  if (mongoose.modelNames().includes("Task")) {
    const Task = mongoose.model("Task");
    const [total, done] = await Promise.all([
      Task.countDocuments({ projectId: project._id }),
      Task.countDocuments({ projectId: project._id, status: "done" }),
    ]);
    if (total === 0) return 0;
    return Math.round((done / total) * 100);
  }

  return 0;
}
