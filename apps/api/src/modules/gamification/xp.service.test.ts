import { describe, it, expect } from "vitest";
import { xpForLevel, computeLevel } from "./xp.service.js";

describe("xp curve", () => {
  it("costs more XP for each successive level", () => {
    expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1));
    expect(xpForLevel(3)).toBeGreaterThan(xpForLevel(2));
  });

  it("computeLevel(0) is level 1 with 0 progress", () => {
    const info = computeLevel(0);
    expect(info.level).toBe(1);
    expect(info.xpIntoLevel).toBe(0);
  });

  it("levels up exactly at the cumulative threshold", () => {
    const level1Cost = xpForLevel(1);
    const justBelow = computeLevel(level1Cost - 1);
    const exactly = computeLevel(level1Cost);
    expect(justBelow.level).toBe(1);
    expect(exactly.level).toBe(2);
    expect(exactly.xpIntoLevel).toBe(0);
  });

  it("xpIntoLevel + remaining consumed always reconstructs totalXp", () => {
    const info = computeLevel(500);
    let consumed = 0;
    for (let l = 1; l < info.level; l++) consumed += xpForLevel(l);
    expect(consumed + info.xpIntoLevel).toBe(500);
  });
});
