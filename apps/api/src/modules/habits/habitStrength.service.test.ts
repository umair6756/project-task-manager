import { describe, it, expect } from "vitest";
import { computeHabitStrength } from "./habitStrength.service.js";

const NOW = new Date("2026-03-05T12:00:00.000Z");

describe("computeHabitStrength", () => {
  it("returns 100 when every required recent day is done", () => {
    const logs = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(NOW.getTime() - i * 86400000);
      return { dateKey: d.toISOString().slice(0, 10), status: "done" as const };
    });
    const strength = computeHabitStrength({ kind: "daily" }, logs, "UTC", 0, NOW);
    expect(strength).toBe(100);
  });

  it("returns 0 with no history at all", () => {
    const strength = computeHabitStrength({ kind: "daily" }, [], "UTC", 0, NOW);
    expect(strength).toBe(0);
  });

  it("gives partial credit for skipped days", () => {
    const doneLogs = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(NOW.getTime() - (i + 1) * 86400000);
      return { dateKey: d.toISOString().slice(0, 10), status: "done" as const };
    });
    const allDone = computeHabitStrength({ kind: "daily" }, doneLogs, "UTC", 0, NOW);

    const skippedLogs = doneLogs.map((l, i) => (i === 0 ? { ...l, status: "skipped" as const } : l));
    const withOneSkip = computeHabitStrength({ kind: "daily" }, skippedLogs, "UTC", 0, NOW);

    expect(withOneSkip).toBeLessThan(allDone);
    expect(withOneSkip).toBeGreaterThan(0);
  });

  it("weighs recent misses more heavily than older ones", () => {
    // Miss yesterday (heavily weighted) vs miss 20 days ago (lightly weighted).
    const base = Array.from({ length: 25 }, (_, i) => {
      const d = new Date(NOW.getTime() - (i + 1) * 86400000);
      return { dateKey: d.toISOString().slice(0, 10), status: "done" as const };
    });

    const missRecent = base.filter((l) => l.dateKey !== base[0]!.dateKey);
    const missOld = base.filter((l) => l.dateKey !== base[19]!.dateKey);

    const recentMissStrength = computeHabitStrength({ kind: "daily" }, missRecent, "UTC", 0, NOW);
    const oldMissStrength = computeHabitStrength({ kind: "daily" }, missOld, "UTC", 0, NOW);

    expect(recentMissStrength).toBeLessThan(oldMissStrength);
  });

  it("only counts scheduled weekdays for a weekdays-type habit", () => {
    // Habit only scheduled Mon/Wed/Fri; today (Thursday) isn't scheduled so
    // it's excluded, and only the required days factor into the score.
    const logs = [
      { dateKey: "2026-03-04", status: "done" as const }, // Wed
      { dateKey: "2026-03-02", status: "done" as const }, // Mon
    ];
    const strength = computeHabitStrength({ kind: "weekdays", weekdays: [1, 3, 5] }, logs, "UTC", 0, NOW);
    expect(strength).toBeGreaterThan(0);
  });
});
