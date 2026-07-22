import { describe, it, expect } from "vitest";
import { computeProjectHealth } from "./projectHealth.service.js";

describe("computeProjectHealth", () => {
  it("is on-track when there is no deadline", () => {
    expect(computeProjectHealth(new Date(), null, 0, "active")).toBe("on-track");
  });

  it("is on-track for done projects regardless of progress", () => {
    const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const deadline = new Date(Date.now() - 1000 * 60 * 60 * 24);
    expect(computeProjectHealth(created, deadline, 10, "done")).toBe("on-track");
  });

  it("is off-track once the deadline has passed and progress is incomplete", () => {
    const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const deadline = new Date(Date.now() - 1000 * 60 * 60 * 24);
    expect(computeProjectHealth(created, deadline, 90, "active")).toBe("off-track");
  });

  it("is on-track when progress is keeping pace with elapsed time", () => {
    const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10); // 10 days ago
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10); // 10 days from now
    // halfway through the timeline (elapsedRatio ~0.5 -> expected ~50%)
    expect(computeProjectHealth(created, deadline, 48, "active")).toBe("on-track");
  });

  it("is at-risk when meaningfully behind schedule", () => {
    const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
    expect(computeProjectHealth(created, deadline, 30, "active")).toBe("at-risk");
  });

  it("is off-track when severely behind schedule", () => {
    const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
    expect(computeProjectHealth(created, deadline, 5, "active")).toBe("off-track");
  });
});
