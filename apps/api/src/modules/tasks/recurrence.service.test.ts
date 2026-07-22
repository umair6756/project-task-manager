import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { Task } from "./task.model.js";
import {
  computeNextOccurrence,
  spawnNextOnComplete,
  materializeFixedOccurrences,
  type RecurrenceConfig,
} from "./recurrence.service.js";

const userId = new mongoose.Types.ObjectId();

describe("computeNextOccurrence (pure)", () => {
  it("daily: adds `interval` days", () => {
    const rec: RecurrenceConfig = { freq: "daily", interval: 2, mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2026-03-05T09:00:00.000Z"), rec);
    expect(next?.toISOString()).toBe("2026-03-07T09:00:00.000Z");
  });

  it("weekly without weekdays: adds interval*7 days", () => {
    const rec: RecurrenceConfig = { freq: "weekly", interval: 2, mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2026-03-05T09:00:00.000Z"), rec); // Thursday
    expect(next?.toISOString()).toBe("2026-03-19T09:00:00.000Z");
  });

  it("weekly with weekdays: finds the next matching weekday", () => {
    // Mon/Wed/Fri, starting from Thursday 2026-03-05
    const rec: RecurrenceConfig = { freq: "weekly", interval: 1, weekdays: [1, 3, 5], mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2026-03-05T09:00:00.000Z"), rec);
    expect(next?.toISOString()).toBe("2026-03-06T09:00:00.000Z"); // Friday
  });

  it("monthly: keeps day-of-month when it exists in the target month", () => {
    const rec: RecurrenceConfig = { freq: "monthly", interval: 1, mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2026-02-15T09:00:00.000Z"), rec);
    expect(next?.toISOString()).toBe("2026-03-15T09:00:00.000Z");
  });

  it("monthly: clamps to month-end when the day doesn't exist (Jan 31 -> Feb 28)", () => {
    const rec: RecurrenceConfig = { freq: "monthly", interval: 1, mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2026-01-31T09:00:00.000Z"), rec);
    expect(next?.toISOString()).toBe("2026-02-28T09:00:00.000Z");
  });

  it("monthly: clamps correctly across a leap-year February", () => {
    const rec: RecurrenceConfig = { freq: "monthly", interval: 1, mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2028-01-31T09:00:00.000Z"), rec); // 2028 is a leap year
    expect(next?.toISOString()).toBe("2028-02-29T09:00:00.000Z");
  });

  it("monthly: wraps into the next year", () => {
    const rec: RecurrenceConfig = { freq: "monthly", interval: 2, mode: "spawn", occurrenceCount: 0 };
    const next = computeNextOccurrence(new Date("2026-11-30T09:00:00.000Z"), rec);
    expect(next?.toISOString()).toBe("2027-01-30T09:00:00.000Z");
  });
});

describe("spawnNextOnComplete (spawn mode)", () => {
  it("creates the next occurrence when the series hasn't ended", async () => {
    const task = await Task.create({
      userId,
      title: "Water plants",
      status: "done",
      dueAt: new Date("2026-03-05T09:00:00.000Z"),
      completedAt: new Date("2026-03-05T09:00:00.000Z"),
      recurrence: { freq: "daily", interval: 1, mode: "spawn", occurrenceCount: 0 },
    });

    const next = await spawnNextOnComplete(task);
    expect(next).not.toBeNull();
    expect(next?.dueAt?.toISOString()).toBe("2026-03-06T09:00:00.000Z");
    expect(next?.recurrence?.occurrenceCount).toBe(1);
    expect(next?.status).toBe("todo");
  });

  it("does not spawn once endAfterOccurrences is reached", async () => {
    const task = await Task.create({
      userId,
      title: "3-day challenge",
      status: "done",
      dueAt: new Date("2026-03-05T09:00:00.000Z"),
      recurrence: { freq: "daily", interval: 1, mode: "spawn", occurrenceCount: 3, endAfterOccurrences: 3 },
    });

    const next = await spawnNextOnComplete(task);
    expect(next).toBeNull();
  });

  it("does not spawn once endDate has passed", async () => {
    const task = await Task.create({
      userId,
      title: "Limited series",
      status: "done",
      dueAt: new Date("2026-03-05T09:00:00.000Z"),
      recurrence: {
        freq: "daily",
        interval: 1,
        mode: "spawn",
        occurrenceCount: 0,
        endDate: new Date("2026-03-05T12:00:00.000Z"),
      },
    });

    const next = await spawnNextOnComplete(task);
    expect(next).toBeNull();
  });

  it("returns null for fixed-mode tasks (they don't spawn on complete)", async () => {
    const task = await Task.create({
      userId,
      title: "Rent",
      status: "done",
      dueAt: new Date("2026-03-05T09:00:00.000Z"),
      recurrence: { freq: "monthly", interval: 1, mode: "fixed", occurrenceCount: 0 },
    });

    const next = await spawnNextOnComplete(task);
    expect(next).toBeNull();
  });
});

describe("materializeFixedOccurrences (fixed mode)", () => {
  it("creates occurrences up to the horizon and is idempotent on re-run", async () => {
    const template = await Task.create({
      userId,
      title: "Pay rent",
      dueAt: new Date(), // due "now" so the daily series has room to grow within 14d
      recurrence: { freq: "daily", interval: 5, mode: "fixed", occurrenceCount: 0 },
    });

    const firstRun = await materializeFixedOccurrences(template, 14);
    expect(firstRun).toBeGreaterThan(0);

    const afterFirst = await Task.countDocuments({ recurrenceParentId: template._id });
    expect(afterFirst).toBe(firstRun);

    // Re-fetch the template (occurrenceCount was persisted) and re-run —
    // nothing new should be created.
    const reloaded = await Task.findById(template._id);
    const secondRun = await materializeFixedOccurrences(reloaded!, 14);
    expect(secondRun).toBe(0);

    const afterSecond = await Task.countDocuments({ recurrenceParentId: template._id });
    expect(afterSecond).toBe(afterFirst);
  });

  it("stops materializing past endAfterOccurrences", async () => {
    const template = await Task.create({
      userId,
      title: "Two-time thing",
      dueAt: new Date(),
      recurrence: { freq: "daily", interval: 1, mode: "fixed", occurrenceCount: 0, endAfterOccurrences: 2 },
    });

    const created = await materializeFixedOccurrences(template, 30);
    expect(created).toBe(2);
  });
});
