import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("goals module", () => {
  it("creates a goal with a manual key result and rolls up progress", async () => {
    const token = await registerAndGetToken(app);
    const goal = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ horizon: "quarter", title: "Ship FlowForge" });
    expect(goal.status).toBe(201);
    expect(goal.body.data.goal.progress).toBe(0);

    const kr = await request(app)
      .post(`/api/goals/${goal.body.data.goal.id}/key-results`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ship 8 phases", type: "number", targetValue: 8, startValue: 0 });
    expect(kr.status).toBe(201);

    await request(app)
      .post(`/api/goals/${goal.body.data.goal.id}/check-ins`)
      .set("Authorization", `Bearer ${token}`)
      .send({ keyResultId: kr.body.data.keyResult._id, value: 4, reflection: "halfway there" });

    const fetched = await request(app).get(`/api/goals/${goal.body.data.goal.id}`).set("Authorization", `Bearer ${token}`);
    expect(fetched.body.data.goal.progress).toBe(50);
  });

  it("rejects an invalid horizon", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).post("/api/goals").set("Authorization", `Bearer ${token}`).send({ horizon: "decade", title: "X" });
    expect(res.status).toBe(400);
  });

  it("auto-binds a KR to tasksCompletedInProject and recomputes its value", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Launch" });
    const task = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ship it", projectId: project.body.data.project.id });
    await request(app).post(`/api/tasks/${task.body.data.task.id}/complete`).set("Authorization", `Bearer ${token}`).send({});

    const goal = await request(app).post("/api/goals").set("Authorization", `Bearer ${token}`).send({ horizon: "month", title: "Launch goal" });
    const kr = await request(app)
      .post(`/api/goals/${goal.body.data.goal.id}/key-results`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete tasks",
        type: "number",
        targetValue: 1,
        binding: { kind: "tasksCompletedInProject", refId: project.body.data.project.id },
      });
    expect(kr.status).toBe(201);
    expect(kr.body.data.keyResult.currentValue).toBe(1);
  });

  it("archives a goal with an outcome note", async () => {
    const token = await registerAndGetToken(app);
    const goal = await request(app).post("/api/goals").set("Authorization", `Bearer ${token}`).send({ horizon: "year", title: "Old goal" });
    const archived = await request(app)
      .post(`/api/goals/${goal.body.data.goal.id}/archive`)
      .set("Authorization", `Bearer ${token}`)
      .send({ outcomeNote: "Didn't finish, deprioritized" });
    expect(archived.body.data.goal.status).toBe("archived");
    expect(archived.body.data.goal.outcomeNote).toBe("Didn't finish, deprioritized");
  });

  it("404s fetching a goal that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "ga@example.com");
    const tokenB = await registerAndGetToken(app, "gb@example.com");
    const goal = await request(app).post("/api/goals").set("Authorization", `Bearer ${tokenA}`).send({ horizon: "month", title: "Private" });
    const res = await request(app).get(`/api/goals/${goal.body.data.goal.id}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});
