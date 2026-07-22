import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("routines module", () => {
  it("creates a routine and runs a run-mode session", async () => {
    const token = await registerAndGetToken(app);
    const habit = await request(app).post("/api/habits").set("Authorization", `Bearer ${token}`).send({ name: "Stretch", schedule: { kind: "daily" } });

    const routine = await request(app)
      .post("/api/routines")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Morning", habitIds: [habit.body.data.habit.id] });
    expect(routine.status).toBe(201);

    const run = await request(app).post(`/api/routines/${routine.body.data.routine.id}/runs`).set("Authorization", `Bearer ${token}`);
    expect(run.status).toBe(201);

    const completed = await request(app)
      .post(`/api/routines/${routine.body.data.routine.id}/runs/${run.body.data.run._id}/complete`)
      .set("Authorization", `Bearer ${token}`);
    expect(completed.status).toBe(200);
    expect(completed.body.data.run.completedAt).toBeTruthy();
  });

  it("rejects a routine with no habits", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).post("/api/routines").set("Authorization", `Bearer ${token}`).send({ name: "Empty", habitIds: [] });
    expect(res.status).toBe(400);
  });
});
