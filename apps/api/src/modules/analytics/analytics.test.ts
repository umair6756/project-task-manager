import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("analytics module", () => {
  it("returns today's score breakdown", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).get("/api/analytics/score/today").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.score).toBe(0);
  });

  it("returns trends including personal records", async () => {
    const token = await registerAndGetToken(app);
    const task = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "X" });
    await request(app).post(`/api/tasks/${task.body.data.task.id}/complete`).set("Authorization", `Bearer ${token}`).send({});

    const res = await request(app).get("/api/analytics/trends").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.velocity.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.bestHours).toHaveLength(24);
  });

  it("returns project burndown and CFD", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Flow" });
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "T1", projectId: project.body.data.project.id });

    const from = new Date(Date.now() - 3 * 86400000).toISOString();
    const to = new Date().toISOString();

    const burndown = await request(app)
      .get(`/api/analytics/projects/${project.body.data.project.id}/burndown?from=${from}&to=${to}`)
      .set("Authorization", `Bearer ${token}`);
    expect(burndown.status).toBe(200);
    expect(burndown.body.data.burndown.length).toBeGreaterThan(0);

    const cfd = await request(app)
      .get(`/api/analytics/projects/${project.body.data.project.id}/cfd?from=${from}&to=${to}`)
      .set("Authorization", `Bearer ${token}`);
    expect(cfd.status).toBe(200);
  });

  it("404s burndown for a project that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "aa@example.com");
    const tokenB = await registerAndGetToken(app, "bb@example.com");
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${tokenA}`).send({ name: "Private" });
    const res = await request(app)
      .get(`/api/analytics/projects/${project.body.data.project.id}/burndown`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});
