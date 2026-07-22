import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("gamification module", () => {
  it("reports XP/level and newly earned achievements after completing a task", async () => {
    const token = await registerAndGetToken(app);
    const task = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "T" });
    const completed = await request(app).post(`/api/tasks/${task.body.data.task.id}/complete`).set("Authorization", `Bearer ${token}`).send({});
    expect(completed.body.data.newlyEarned.map((e: { key: string }) => e.key)).toContain("tasksCompleted_1");

    const me = await request(app).get("/api/gamification/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.levelInfo.totalXp).toBeGreaterThan(0);
    expect(me.body.data.achievements).toHaveLength(50);
  });

  it("earns and spends a streak-freeze token", async () => {
    const token = await registerAndGetToken(app);
    const habit = await request(app).post("/api/habits").set("Authorization", `Bearer ${token}`).send({ name: "H", schedule: { kind: "daily" } });

    // Not enough streak yet -> spend should fail with no tokens.
    const noToken = await request(app)
      .post("/api/gamification/streak-freeze/spend")
      .set("Authorization", `Bearer ${token}`)
      .send({ habitId: habit.body.data.habit.id });
    expect(noToken.status).toBe(400);
  });

  it("rejects spending a streak-freeze token on a habit that isn't the user's", async () => {
    const tokenA = await registerAndGetToken(app, "ga2@example.com");
    const tokenB = await registerAndGetToken(app, "gb2@example.com");
    const habit = await request(app).post("/api/habits").set("Authorization", `Bearer ${tokenA}`).send({ name: "H", schedule: { kind: "daily" } });
    const res = await request(app)
      .post("/api/gamification/streak-freeze/spend")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ habitId: habit.body.data.habit.id });
    expect(res.status).toBe(404);
  });
});
