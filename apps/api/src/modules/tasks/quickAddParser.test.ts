import { describe, it, expect } from "vitest";
import { parseQuickAdd } from "./quickAddParser.js";

const NOW = new Date("2026-03-05T12:00:00.000Z"); // a Thursday

describe("parseQuickAdd", () => {
  it("parses a plain title with no tokens", () => {
    const r = parseQuickAdd("buy milk", NOW);
    expect(r.title).toBe("buy milk");
    expect(r.priority).toBeNull();
    expect(r.labelNames).toEqual([]);
    expect(r.projectName).toBeNull();
    expect(r.dueAt).toBeNull();
  });

  it("parses priority", () => {
    const r = parseQuickAdd("finish report p1", NOW);
    expect(r.title).toBe("finish report");
    expect(r.priority).toBe("P1");
  });

  it("parses multiple labels", () => {
    const r = parseQuickAdd("call mom #family #calls", NOW);
    expect(r.title).toBe("call mom");
    expect(r.labelNames).toEqual(["family", "calls"]);
  });

  it("parses a project reference", () => {
    const r = parseQuickAdd("draft proposal @renovation", NOW);
    expect(r.title).toBe("draft proposal");
    expect(r.projectName).toBe("renovation");
  });

  it("parses 'today'", () => {
    const r = parseQuickAdd("submit form today", NOW);
    expect(r.title).toBe("submit form");
    expect(r.dueAt?.toISOString()).toBe("2026-03-05T00:00:00.000Z");
  });

  it("parses 'tomorrow'", () => {
    const r = parseQuickAdd("pay bill tomorrow", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-03-06T00:00:00.000Z");
  });

  it("parses a weekday name as the next occurrence", () => {
    // NOW is Thursday 2026-03-05; "mon" should resolve to 2026-03-09
    const r = parseQuickAdd("standup mon", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-03-09T00:00:00.000Z");
  });

  it("parses '5pm' attached to today when no date is given", () => {
    const r = parseQuickAdd("call client 5pm", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-03-05T17:00:00.000Z");
  });

  it("parses '5:30pm' with minutes", () => {
    const r = parseQuickAdd("call client 5:30pm", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-03-05T17:30:00.000Z");
  });

  it("parses a 24-hour time", () => {
    const r = parseQuickAdd("call client 17:00", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-03-05T17:00:00.000Z");
  });

  it("parses 'tomorrow 5pm' together", () => {
    const r = parseQuickAdd("pay bill tomorrow 5pm", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-03-06T17:00:00.000Z");
  });

  it("parses '15 aug' (day then month)", () => {
    const r = parseQuickAdd("vacation starts 15 aug", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-08-15T00:00:00.000Z");
  });

  it("parses 'aug 15' (month then day)", () => {
    const r = parseQuickAdd("vacation starts aug 15", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-08-15T00:00:00.000Z");
  });

  it("rolls a past day/month date into next year", () => {
    // NOW is March 2026; "15 jan" has already passed this year.
    const r = parseQuickAdd("renew passport 15 jan", NOW);
    expect(r.dueAt?.toISOString()).toBe("2027-01-15T00:00:00.000Z");
  });

  it("parses an ISO date", () => {
    const r = parseQuickAdd("deploy 2026-04-01", NOW);
    expect(r.dueAt?.toISOString()).toBe("2026-04-01T00:00:00.000Z");
  });

  it("parses the full combined example from the brief", () => {
    const r = parseQuickAdd("pay bill tomorrow 5pm p1 #home", NOW);
    expect(r.title).toBe("pay bill");
    expect(r.priority).toBe("P1");
    expect(r.labelNames).toEqual(["home"]);
    expect(r.dueAt?.toISOString()).toBe("2026-03-06T17:00:00.000Z");
  });

  it("parses tokens in a different order", () => {
    const r = parseQuickAdd("#home p1 pay bill @renovation tomorrow 5pm", NOW);
    expect(r.title).toBe("pay bill");
    expect(r.priority).toBe("P1");
    expect(r.labelNames).toEqual(["home"]);
    expect(r.projectName).toBe("renovation");
    expect(r.dueAt?.toISOString()).toBe("2026-03-06T17:00:00.000Z");
  });

  it("collapses extra whitespace left behind after stripping tokens", () => {
    const r = parseQuickAdd("  pay   bill   p2   ", NOW);
    expect(r.title).toBe("pay bill");
    expect(r.priority).toBe("P2");
  });
});
