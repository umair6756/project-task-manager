import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { TimeEntry } from "../time/timeEntry.model.js";
import { Habit } from "../habits/habit.model.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { computeDailyProductivityScore } from "./productivityScore.service.js";

const userId = new mongoose.Types.ObjectId();
const dayStart = new Date("2026-03-05T00:00:00.000Z");
const dayEnd = new Date("2026-03-06T00:00:00.000Z");

describe("computeDailyProductivityScore", () => {
  it("returns 0 across the board with no activity", async () => {
    const result = await computeDailyProductivityScore(String(userId), dayStart, dayEnd);
    expect(result.score).toBe(0);
  });

  it("weighs completing a P1 task more than a P4 task", async () => {
    const u1 = new mongoose.Types.ObjectId();
    await Task.create({ userId: u1, title: "big", priority: "P1", completedAt: new Date("2026-03-05T10:00:00.000Z") });
    const p1Result = await computeDailyProductivityScore(String(u1), dayStart, dayEnd);

    const u2 = new mongoose.Types.ObjectId();
    await Task.create({ userId: u2, title: "small", priority: "P4", completedAt: new Date("2026-03-05T10:00:00.000Z") });
    const p4Result = await computeDailyProductivityScore(String(u2), dayStart, dayEnd);

    expect(p1Result.tasksScore).toBeGreaterThan(p4Result.tasksScore);
  });

  it("caps focusScore at 1 even with excessive tracked time", async () => {
    const u = new mongoose.Types.ObjectId();
    await TimeEntry.create({
      userId: u,
      source: "manual",
      start: new Date("2026-03-05T08:00:00.000Z"),
      end: new Date("2026-03-05T20:00:00.000Z"), // 12 hours, way past the 120min target
    });
    const result = await computeDailyProductivityScore(String(u), dayStart, dayEnd);
    expect(result.focusScore).toBe(1);
  });

  it("computes habitScore as done/scheduled habits", async () => {
    const u = new mongoose.Types.ObjectId();
    const h1 = await Habit.create({ userId: u, name: "A", schedule: { kind: "daily" } });
    await Habit.create({ userId: u, name: "B", schedule: { kind: "daily" } });
    await HabitLog.create({ userId: u, habitId: h1._id, dateKey: "2026-03-05", status: "done" });

    const result = await computeDailyProductivityScore(String(u), dayStart, dayEnd);
    expect(result.habitScore).toBe(0.5);
  });
});
