import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("time entries module", () => {
  it("starts and stops a timer", async () => {
    const token = await registerAndGetToken(app);
    const started = await request(app).post("/api/time-entries/start").set("Authorization", `Bearer ${token}`).send({});
    expect(started.status).toBe(201);
    expect(started.body.data.entry.end).toBeNull();

    const running = await request(app).get("/api/time-entries/running").set("Authorization", `Bearer ${token}`);
    expect(running.body.data.running).toBeTruthy();

    const stopped = await request(app).post("/api/time-entries/stop").set("Authorization", `Bearer ${token}`);
    expect(stopped.status).toBe(200);
    expect(stopped.body.data.entry.end).toBeTruthy();
  });

  it("rejects starting a second timer while one is running (409)", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/time-entries/start").set("Authorization", `Bearer ${token}`).send({});
    const second = await request(app).post("/api/time-entries/start").set("Authorization", `Bearer ${token}`).send({});
    expect(second.status).toBe(409);
  });

  it("creates a manual entry and rejects an overlapping one", async () => {
    const token = await registerAndGetToken(app);
    const entry = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T09:00:00.000Z", end: "2026-03-05T10:00:00.000Z" });
    expect(entry.status).toBe(201);

    const overlapping = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T09:30:00.000Z", end: "2026-03-05T10:30:00.000Z" });
    expect(overlapping.status).toBe(409);

    const nonOverlapping = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T10:00:00.000Z", end: "2026-03-05T11:00:00.000Z" });
    expect(nonOverlapping.status).toBe(201);
  });

  it("rejects a manual entry with end before start", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T10:00:00.000Z", end: "2026-03-05T09:00:00.000Z" });
    expect(res.status).toBe(400);
  });

  it("updating an entry checks overlap excluding itself", async () => {
    const token = await registerAndGetToken(app);
    const entry = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T09:00:00.000Z", end: "2026-03-05T10:00:00.000Z" });

    const updated = await request(app)
      .patch(`/api/time-entries/${entry.body.data.entry.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ end: "2026-03-05T10:15:00.000Z" });
    expect(updated.status).toBe(200);
  });

  it("deletes a time entry", async () => {
    const token = await registerAndGetToken(app);
    const entry = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T09:00:00.000Z", end: "2026-03-05T10:00:00.000Z" });
    const del = await request(app).delete(`/api/time-entries/${entry.body.data.entry.id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
  });
});
