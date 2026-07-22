import { describe, it, expect } from "vitest";
import { computeKeyResultProgress, computeGoalProgress, computeGoalTrafficLight } from "./goalProgress.service.js";

describe("computeKeyResultProgress", () => {
  it("computes a number KR's progress ratio", () => {
    expect(computeKeyResultProgress({ type: "number", startValue: 0, targetValue: 10, currentValue: 5 })).toBe(50);
  });

  it("clamps above target to 100", () => {
    expect(computeKeyResultProgress({ type: "number", startValue: 0, targetValue: 10, currentValue: 20 })).toBe(100);
  });

  it("clamps below start to 0", () => {
    expect(computeKeyResultProgress({ type: "number", startValue: 5, targetValue: 10, currentValue: 0 })).toBe(0);
  });

  it("treats a boolean KR as 100 or 0", () => {
    expect(computeKeyResultProgress({ type: "boolean", startValue: 0, targetValue: 1, currentValue: 1 })).toBe(100);
    expect(computeKeyResultProgress({ type: "boolean", startValue: 0, targetValue: 1, currentValue: 0 })).toBe(0);
  });
});

describe("computeGoalProgress", () => {
  it("averages multiple KRs", () => {
    const krs = [
      { type: "number" as const, startValue: 0, targetValue: 10, currentValue: 10 }, // 100
      { type: "number" as const, startValue: 0, targetValue: 10, currentValue: 0 }, // 0
    ];
    expect(computeGoalProgress(krs)).toBe(50);
  });

  it("returns 0 for a goal with no KRs", () => {
    expect(computeGoalProgress([])).toBe(0);
  });
});

describe("computeGoalTrafficLight", () => {
  it("is on-track for an archived goal regardless of progress", () => {
    const goal = { horizon: "month", createdAt: new Date(Date.now() - 40 * 86400000), status: "archived" as const };
    expect(computeGoalTrafficLight(goal, 10)).toBe("on-track");
  });

  it("is off-track once the horizon has elapsed and progress is incomplete", () => {
    const goal = { horizon: "month", createdAt: new Date(Date.now() - 40 * 86400000), status: "active" as const };
    expect(computeGoalTrafficLight(goal, 50)).toBe("off-track");
  });

  it("is on-track when keeping pace with elapsed time", () => {
    const goal = { horizon: "month", createdAt: new Date(Date.now() - 15 * 86400000), status: "active" as const }; // half a month elapsed
    expect(computeGoalTrafficLight(goal, 48)).toBe("on-track");
  });

  it("is at-risk when meaningfully behind pace", () => {
    const goal = { horizon: "month", createdAt: new Date(Date.now() - 15 * 86400000), status: "active" as const };
    expect(computeGoalTrafficLight(goal, 30)).toBe("at-risk");
  });
});
