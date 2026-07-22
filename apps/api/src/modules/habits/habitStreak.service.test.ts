import { describe, it, expect } from "vitest";
import { computeHabitStreak } from "./habitStreak.service.js";

const NOW = new Date("2026-03-05T12:00:00.000Z"); // Thursday

function log(dateKey: string, status: "done" | "skipped") {
  return { dateKey, status } as { dateKey: string; status: "done" | "skipped" };
}

describe("computeHabitStreak — daily schedule", () => {
  it("counts consecutive done days ending yesterday (today not logged yet)", () => {
    const logs = [log("2026-03-04", "done"), log("2026-03-03", "done"), log("2026-03-02", "done")];
    const result = computeHabitStreak({ kind: "daily" }, logs, "UTC", 0, 1, NOW);
    expect(result.current).toBe(3);
  });

  it("includes today when it's already logged done", () => {
    const logs = [log("2026-03-05", "done"), log("2026-03-04", "done")];
    const result = computeHabitStreak({ kind: "daily" }, logs, "UTC", 0, 1, NOW);
    expect(result.current).toBe(2);
  });

  it("breaks the streak on a missed required day", () => {
    const logs = [log("2026-03-04", "done"), log("2026-03-02", "done")]; // gap on 03-03
    const result = computeHabitStreak({ kind: "daily" }, logs, "UTC", 0, 1, NOW);
    expect(result.current).toBe(1); // only 03-04 counts before hitting the gap
  });

  it("a skip preserves the streak without extending it", () => {
    const logs = [log("2026-03-04", "skipped"), log("2026-03-03", "done"), log("2026-03-02", "done")];
    const result = computeHabitStreak({ kind: "daily" }, logs, "UTC", 0, 1, NOW);
    // 03-04 skipped (neutral), 03-03 and 03-02 done -> streak of 2
    expect(result.current).toBe(2);
  });

  it("respects a 3am day-end hour boundary", () => {
    // "now" is 1am UTC on 03-05 with a 3am day-end -> logical day is still 03-04
    const earlyNow = new Date("2026-03-05T01:00:00.000Z");
    const logs = [log("2026-03-03", "done"), log("2026-03-02", "done")];
    const result = computeHabitStreak({ kind: "daily" }, logs, "UTC", 3, 1, earlyNow);
    // logical "today" is 03-04 (unlogged, fine), then 03-03 done, 03-02 done
    expect(result.current).toBe(2);
  });
});

describe("computeHabitStreak — weekdays schedule", () => {
  it("only requires logs on scheduled weekdays, ignoring others", () => {
    // Mon/Wed/Fri schedule. NOW is Thursday 2026-03-05 (not a scheduled day).
    // Required days walking back: Wed 03-04, Mon 03-02, Fri 02-27...
    const logs = [log("2026-03-04", "done"), log("2026-03-02", "done"), log("2026-02-27", "done")];
    const result = computeHabitStreak(
      { kind: "weekdays", weekdays: [1, 3, 5] },
      logs,
      "UTC",
      0,
      1,
      NOW,
    );
    expect(result.current).toBe(3);
  });

  it("breaks when a scheduled weekday is missed", () => {
    const logs = [log("2026-03-04", "done")]; // missing Mon 03-02
    const result = computeHabitStreak(
      { kind: "weekdays", weekdays: [1, 3, 5] },
      logs,
      "UTC",
      0,
      1,
      NOW,
    );
    expect(result.current).toBe(1);
  });
});

describe("computeHabitStreak — perWeek schedule", () => {
  it("counts a fully-satisfied prior week and a partially-satisfied current week without breaking", () => {
    // timesPerWeek=3, weekStartDay=1 (Monday). NOW is Thursday 2026-03-05,
    // so the current week (Mon 03-02..Thu 03-05 so far) only has 2 done —
    // not satisfied yet, but shouldn't break since the week isn't over.
    const logs = [
      log("2026-03-03", "done"),
      log("2026-03-04", "done"),
      // previous week (02-23..03-01) fully satisfied with 3 done
      log("2026-02-24", "done"),
      log("2026-02-26", "done"),
      log("2026-02-28", "done"),
    ];
    const result = computeHabitStreak(
      { kind: "perWeek", timesPerWeek: 3 },
      logs,
      "UTC",
      0,
      1,
      NOW,
    );
    expect(result.current).toBe(1); // only the fully-satisfied prior week counts
  });

  it("counts the current week too once it's already satisfied", () => {
    const logs = [
      log("2026-03-02", "done"),
      log("2026-03-03", "done"),
      log("2026-03-04", "done"), // current week already has 3 done
      log("2026-02-24", "done"),
      log("2026-02-26", "done"),
      log("2026-02-28", "done"),
    ];
    const result = computeHabitStreak(
      { kind: "perWeek", timesPerWeek: 3 },
      logs,
      "UTC",
      0,
      1,
      NOW,
    );
    expect(result.current).toBe(2);
  });

  it("treats skips as counting toward the weekly requirement", () => {
    const logs = [
      log("2026-02-24", "done"),
      log("2026-02-25", "done"),
      log("2026-02-26", "skipped"), // vacation day, still satisfies the week of 3
    ];
    const result = computeHabitStreak(
      { kind: "perWeek", timesPerWeek: 3 },
      logs,
      "UTC",
      0,
      1,
      NOW,
    );
    expect(result.current).toBe(1);
  });

  it("breaks on a fully-elapsed unsatisfied week", () => {
    const logs = [log("2026-02-24", "done")]; // only 1 of 3 required, week is over
    const result = computeHabitStreak(
      { kind: "perWeek", timesPerWeek: 3 },
      logs,
      "UTC",
      0,
      1,
      NOW,
    );
    expect(result.current).toBe(0);
  });
});
