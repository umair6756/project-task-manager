import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("time reports", () => {
  it("reports time by project for a date range", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Reported" });
    const task = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Do work", projectId: project.body.data.project.id, estimateMin: 120 });

    await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ taskId: task.body.data.task.id, start: "2026-03-05T09:00:00.000Z", end: "2026-03-05T10:00:00.000Z" });

    const report = await request(app)
      .get("/api/reports/time-by-project?from=2026-03-01T00:00:00.000Z&to=2026-03-10T00:00:00.000Z")
      .set("Authorization", `Bearer ${token}`);
    expect(report.status).toBe(200);
    const row = report.body.data.byProject.find((r: { projectId: string }) => r.projectId === project.body.data.project.id);
    expect(row.minutes).toBe(60);
  });

  it("reports estimates vs actuals for a project", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "EstVsAct" });
    const task = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Estimated work", projectId: project.body.data.project.id, estimateMin: 90 });
    await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ taskId: task.body.data.task.id, start: "2026-03-05T09:00:00.000Z", end: "2026-03-05T10:30:00.000Z" });

    const res = await request(app).get(`/api/reports/estimates-vs-actuals/${project.body.data.project.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.body.data.estimateMin).toBe(90);
    expect(res.body.data.actualMin).toBe(90);
  });

  it("computes deep-work heat by hour", async () => {
    const token = await registerAndGetToken(app);
    await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ start: "2026-03-05T09:00:00.000Z", end: "2026-03-05T09:30:00.000Z" });

    const res = await request(app)
      .get("/api/reports/deep-work-heat?from=2026-03-01T00:00:00.000Z&to=2026-03-10T00:00:00.000Z")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.data.byHour).toHaveLength(24);
    expect(res.body.data.byHour[9]).toBe(30);
  });

  it("reports area budget consumption from user settings", async () => {
    const token = await registerAndGetToken(app);
    const area = await request(app).post("/api/areas").set("Authorization", `Bearer ${token}`).send({ name: "Health" });
    await request(app)
      .put("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ areaBudgets: { [area.body.data.area.id]: 5 } });

    const res = await request(app).get("/api/reports/area-budgets").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.budgets[0].budgetHours).toBe(5);
  });

  it("rejects a report request missing the required range", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).get("/api/reports/time-by-project").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
