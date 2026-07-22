import { describe, it, expect } from "vitest";
import { getLogicalDay, getLogicalDayRange } from "./dateService.js";

describe("dateService.getLogicalDay", () => {
  it("UTC, midnight day-end: matches the plain calendar date", () => {
    const now = new Date("2026-03-05T15:30:00.000Z");
    const day = getLogicalDay("UTC", 0, now);
    expect(day.dateKey).toBe("2026-03-05");
    expect(day.startUtc.toISOString()).toBe("2026-03-05T00:00:00.000Z");
    expect(day.endUtc.toISOString()).toBe("2026-03-06T00:00:00.000Z");
  });

  it("day-end hour of 3am: 1am local still belongs to the previous logical day", () => {
    // 2026-03-05T01:00 UTC is before the 3am boundary -> logical day is 03-04
    const now = new Date("2026-03-05T01:00:00.000Z");
    const day = getLogicalDay("UTC", 3, now);
    expect(day.dateKey).toBe("2026-03-04");
    expect(day.startUtc.toISOString()).toBe("2026-03-04T03:00:00.000Z");
    expect(day.endUtc.toISOString()).toBe("2026-03-05T03:00:00.000Z");
  });

  it("day-end hour of 3am: 4am local belongs to the current logical day", () => {
    const now = new Date("2026-03-05T04:00:00.000Z");
    const day = getLogicalDay("UTC", 3, now);
    expect(day.dateKey).toBe("2026-03-05");
  });

  it("respects a named timezone (America/New_York, UTC-5 in winter)", () => {
    // 2026-01-15T04:30 UTC = 2026-01-14T23:30 in New York (EST, UTC-5)
    const now = new Date("2026-01-15T04:30:00.000Z");
    const day = getLogicalDay("America/New_York", 0, now);
    expect(day.dateKey).toBe("2026-01-14");
    // Local midnight 2026-01-14T00:00 EST -> 2026-01-14T05:00Z
    expect(day.startUtc.toISOString()).toBe("2026-01-14T05:00:00.000Z");
  });

  it("handles the US spring-forward DST transition (2026-03-08) without drifting a day", () => {
    // Noon on DST-change day in New York, well clear of the 2am transition itself.
    const now = new Date("2026-03-08T17:00:00.000Z"); // 12:00 EDT (UTC-4 after the switch)
    const day = getLogicalDay("America/New_York", 0, now);
    expect(day.dateKey).toBe("2026-03-08");
    // Midnight local on the transition date is still EST (UTC-5) since the
    // 2am->3am jump hasn't happened yet at 00:00.
    expect(day.startUtc.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    // The *next* boundary (next midnight) is already on EDT (UTC-4).
    expect(day.endUtc.toISOString()).toBe("2026-03-09T04:00:00.000Z");
  });

  it("handles the US fall-back DST transition (2026-11-01) without drifting a day", () => {
    const now = new Date("2026-11-01T17:00:00.000Z"); // noon local, after the fall-back
    const day = getLogicalDay("America/New_York", 0, now);
    expect(day.dateKey).toBe("2026-11-01");
  });
});

describe("dateService.getLogicalDayRange", () => {
  it("spans N full logical days from today's start", () => {
    const now = new Date("2026-03-05T15:00:00.000Z");
    const range = getLogicalDayRange("UTC", 0, 7, now);
    expect(range.startUtc.toISOString()).toBe("2026-03-05T00:00:00.000Z");
    expect(range.endUtc.toISOString()).toBe("2026-03-12T00:00:00.000Z");
  });

  it("a 1-day range is just today", () => {
    const now = new Date("2026-03-05T15:00:00.000Z");
    const range = getLogicalDayRange("UTC", 0, 1, now);
    expect(range.endUtc.toISOString()).toBe("2026-03-06T00:00:00.000Z");
  });
});
