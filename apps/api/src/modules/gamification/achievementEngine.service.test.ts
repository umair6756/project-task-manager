import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { checkAchievementsForStat, maybeAwardStreakFreezeToken } from "./achievementEngine.service.js";
import { UserAchievement, UserGamification, StreakFreezeToken } from "./userGamification.model.js";

describe("checkAchievementsForStat", () => {
  it("awards the first-tier tasksCompleted achievement and XP once the stat is met", async () => {
    const userId = new mongoose.Types.ObjectId();
    await Task.create({ userId, title: "T", status: "done" });

    const earned = await checkAchievementsForStat(String(userId), "tasksCompleted");
    expect(earned.map((e) => e.key)).toContain("tasksCompleted_1");

    const gamification = await UserGamification.findOne({ userId });
    expect(gamification?.totalXp).toBeGreaterThan(0);
  });

  it("does not re-award an already-earned achievement", async () => {
    const userId = new mongoose.Types.ObjectId();
    await Task.create({ userId, title: "T", status: "done" });
    await checkAchievementsForStat(String(userId), "tasksCompleted");

    const secondCall = await checkAchievementsForStat(String(userId), "tasksCompleted");
    expect(secondCall.map((e) => e.key)).not.toContain("tasksCompleted_1");

    const count = await UserAchievement.countDocuments({ userId, achievementKey: "tasksCompleted_1" });
    expect(count).toBe(1);
  });
});

describe("maybeAwardStreakFreezeToken", () => {
  it("awards a token when crossing a multiple of 7", async () => {
    const userId = new mongoose.Types.ObjectId();
    const awarded = await maybeAwardStreakFreezeToken(String(userId), 6, 7);
    expect(awarded).toBe(true);
    const count = await StreakFreezeToken.countDocuments({ userId });
    expect(count).toBe(1);
  });

  it("does not award a token for a non-multiple-of-7 streak", async () => {
    const userId = new mongoose.Types.ObjectId();
    const awarded = await maybeAwardStreakFreezeToken(String(userId), 7, 8);
    expect(awarded).toBe(false);
  });
});
