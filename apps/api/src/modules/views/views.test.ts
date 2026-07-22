import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("smart views", () => {
  it("today view separates overdue from due-today, using UTC default timezone", async () => {
    const token = await registerAndGetToken(app);
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const todayNoon = new Date(now);
    todayNoon.setUTCHours(12, 0, 0, 0);

    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Overdue", dueAt: yesterday });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Due Today", dueAt: todayNoon.toISOString() });

    const res = await request(app).get("/api/views/today").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toHaveLength(1);
    expect(res.body.data.overdue[0].title).toBe("Overdue");
    expect(res.body.data.dueToday).toHaveLength(1);
    expect(res.body.data.dueToday[0].title).toBe("Due Today");
  });

  it("upcoming view respects the days query param", async () => {
    const token = await registerAndGetToken(app);
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const in20Days = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Soon", dueAt: in3Days });
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Later", dueAt: in20Days });

    const week = await request(app).get("/api/views/upcoming?days=7").set("Authorization", `Bearer ${token}`);
    expect(week.body.data.tasks).toHaveLength(1);

    const month = await request(app).get("/api/views/upcoming?days=30").set("Authorization", `Bearer ${token}`);
    expect(month.body.data.tasks).toHaveLength(2);
  });

  it("inbox view only returns tasks with no project", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "P" });
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "In project", projectId: project.body.data.project.id });
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "In inbox" });

    const res = await request(app).get("/api/views/inbox").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0].title).toBe("In inbox");
  });

  it("anytime view only returns tasks with no due/start date", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Someday" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Scheduled", dueAt: new Date().toISOString() });

    const res = await request(app).get("/api/views/anytime").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0].title).toBe("Someday");
  });
});
