import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("planning module", () => {
  it("gets-or-creates today's plan idempotently", async () => {
    const token = await registerAndGetToken(app);
    const first = await request(app).get("/api/planning/daily").set("Authorization", `Bearer ${token}`);
    const second = await request(app).get("/api/planning/daily").set("Authorization", `Bearer ${token}`);
    expect(first.body.data.plan.id).toBe(second.body.data.plan.id);
  });

  it("sets up to 3 MITs and rejects a 4th", async () => {
    const token = await registerAndGetToken(app);
    const tasks = await Promise.all(
      [1, 2, 3, 4].map((n) => request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: `T${n}` })),
    );

    const ok3 = await request(app)
      .put("/api/planning/mits")
      .set("Authorization", `Bearer ${token}`)
      .send({ taskIds: tasks.slice(0, 3).map((t) => t.body.data.task.id) });
    expect(ok3.status).toBe(200);
    expect(ok3.body.data.plan.mitTaskIds).toHaveLength(3);

    const tooMany = await request(app)
      .put("/api/planning/mits")
      .set("Authorization", `Bearer ${token}`)
      .send({ taskIds: tasks.map((t) => t.body.data.task.id) });
    expect(tooMany.status).toBe(400);
  });

  it("completes the shutdown ritual", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/planning/shutdown")
      .set("Authorization", `Bearer ${token}`)
      .send({ shutdownNotes: "good day", tomorrowNotes: "finish the report" });
    expect(res.status).toBe(200);
    expect(res.body.data.plan.shutdownDone).toBe(true);
  });

  it("updates plan notes", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).patch("/api/planning/daily").set("Authorization", `Bearer ${token}`).send({ planNotes: "focus on X" });
    expect(res.body.data.plan.planNotes).toBe("focus on X");
  });
});
