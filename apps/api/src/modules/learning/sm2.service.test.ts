import { describe, it, expect } from "vitest";
import { gradeSrs, type Srs } from "./sm2.service.js";

const NOW = new Date("2026-03-05T12:00:00.000Z");

function freshSrs(overrides: Partial<Srs> = {}): Srs {
  return { ease: 2.5, intervalDays: 0, dueAt: NOW, reps: 0, lapses: 0, state: "new", ...overrides };
}

describe("gradeSrs — new/learning card", () => {
  it("Again keeps it in learning, due immediately", () => {
    const next = gradeSrs(freshSrs(), "again", NOW);
    expect(next.state).toBe("learning");
    expect(next.intervalDays).toBe(0);
    expect(next.dueAt).toEqual(NOW);
    expect(next.reps).toBe(0);
  });

  it("Hard keeps it in learning too (collapsed same-day steps)", () => {
    const next = gradeSrs(freshSrs(), "hard", NOW);
    expect(next.state).toBe("learning");
    expect(next.intervalDays).toBe(0);
  });

  it("Good promotes to review with a 1-day interval", () => {
    const next = gradeSrs(freshSrs(), "good", NOW);
    expect(next.state).toBe("review");
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt.toISOString()).toBe("2026-03-06T12:00:00.000Z");
    expect(next.reps).toBe(1);
  });

  it("Easy promotes to review with a bigger 4-day interval", () => {
    const next = gradeSrs(freshSrs(), "easy", NOW);
    expect(next.state).toBe("review");
    expect(next.intervalDays).toBe(4);
    expect(next.reps).toBe(1);
  });
});

describe("gradeSrs — review-state card", () => {
  it("Good grows the interval by the ease factor", () => {
    const srs = freshSrs({ state: "review", intervalDays: 6, ease: 2.5, reps: 2 });
    const next = gradeSrs(srs, "good", NOW);
    expect(next.intervalDays).toBe(15); // 6 * 2.5 = 15
    expect(next.ease).toBe(2.5); // unchanged
    expect(next.reps).toBe(3);
  });

  it("Easy grows the ease factor and applies the easy bonus multiplier", () => {
    const srs = freshSrs({ state: "review", intervalDays: 6, ease: 2.5, reps: 2 });
    const next = gradeSrs(srs, "easy", NOW);
    expect(next.ease).toBeCloseTo(2.65);
    expect(next.intervalDays).toBe(Math.round(6 * 2.65 * 1.3));
  });

  it("Hard shrinks growth relative to Good and dings the ease factor", () => {
    const srs = freshSrs({ state: "review", intervalDays: 6, ease: 2.5, reps: 2 });
    const next = gradeSrs(srs, "hard", NOW);
    expect(next.ease).toBeCloseTo(2.35);
    expect(next.intervalDays).toBe(Math.round(6 * 1.2));
    expect(next.intervalDays).toBeLessThan(15); // less growth than Good's 15
  });

  it("Again causes a lapse: resets interval/reps, drops ease, goes back to learning", () => {
    const srs = freshSrs({ state: "review", intervalDays: 20, ease: 2.5, reps: 5, lapses: 1 });
    const next = gradeSrs(srs, "again", NOW);
    expect(next.state).toBe("learning");
    expect(next.intervalDays).toBe(0);
    expect(next.reps).toBe(0);
    expect(next.lapses).toBe(2);
    expect(next.ease).toBeCloseTo(2.3);
  });

  it("ease never drops below the 1.3 floor even after repeated Again grades", () => {
    let srs = freshSrs({ state: "review", intervalDays: 10, ease: 1.35, reps: 3 });
    srs = gradeSrs(srs, "again", NOW);
    srs = { ...srs, state: "review", intervalDays: 10 }; // simulate it came back to review
    srs = gradeSrs(srs, "again", NOW);
    expect(srs.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("minimum interval after Hard/Good/Easy is always at least 1 day", () => {
    const srs = freshSrs({ state: "review", intervalDays: 0, ease: 2.5, reps: 1 });
    const next = gradeSrs(srs, "good", NOW);
    expect(next.intervalDays).toBeGreaterThanOrEqual(1);
  });
});
