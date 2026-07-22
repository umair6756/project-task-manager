import { describe, it, expect } from "vitest";
import { isoWeekToDateRange } from "./isoWeek.js";

describe("isoWeekToDateRange", () => {
  it("resolves a mid-year week", () => {
    // 2026-03-05 is a Thursday in ISO week 10 of 2026.
    const { start, end } = isoWeekToDateRange("2026-W10");
    expect(start.getUTCDay()).toBe(1); // Monday
    expect(end.getTime() - start.getTime()).toBe(7 * 86400000);
    expect(start.toISOString().slice(0, 10)).toBe("2026-03-02");
  });

  it("resolves week 1 correctly across the year boundary", () => {
    const { start } = isoWeekToDateRange("2026-W01");
    expect(start.getUTCDay()).toBe(1);
    expect(start.getUTCFullYear()).toBe(2025); // week 1 of 2026 starts in late Dec 2025
  });

  it("throws on a malformed input", () => {
    expect(() => isoWeekToDateRange("not-a-week")).toThrow();
  });
});
