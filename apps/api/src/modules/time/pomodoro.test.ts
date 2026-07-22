import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("pomodoro module", () => {
  it("runs a full session, logging a time entry per cycle", async () => {
    const token = await registerAndGetToken(app);
    const session = await request(app)
      .post("/api/pomodoro")
      .set("Authorization", `Bearer ${token}`)
      .send({ workLenMin: 25, breakLenMin: 5, cycles: 2 });
    expect(session.status).toBe(201);

    const cycle1 = await request(app).post(`/api/pomodoro/${session.body.data.session.id}/complete-cycle`).set("Authorization", `Bearer ${token}`);
    expect(cycle1.body.data.session.currentCycle).toBe(2);
    expect(cycle1.body.data.session.completedAt).toBeNull();

    const cycle2 = await request(app).post(`/api/pomodoro/${session.body.data.session.id}/complete-cycle`).set("Authorization", `Bearer ${token}`);
    expect(cycle2.body.data.session.completedAt).toBeTruthy();

    const entries = await request(app).get("/api/time-entries").set("Authorization", `Bearer ${token}`);
    expect(entries.body.data.entries.filter((e: { source: string }) => e.source === "pomodoro")).toHaveLength(2);
  });

  it("stops a session early", async () => {
    const token = await registerAndGetToken(app);
    const session = await request(app).post("/api/pomodoro").set("Authorization", `Bearer ${token}`).send({});
    const stopped = await request(app).post(`/api/pomodoro/${session.body.data.session.id}/stop`).set("Authorization", `Bearer ${token}`);
    expect(stopped.body.data.session.completedAt).toBeTruthy();
  });
});
