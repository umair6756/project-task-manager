import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

async function createTask(token: string, body: Record<string, unknown>) {
  return request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send(body);
}

describe("tasks module", () => {
  it("creates and fetches a task", async () => {
    const token = await registerAndGetToken(app);
    const created = await createTask(token, { title: "Write report", priority: "P2" });
    expect(created.status).toBe(201);
    expect(created.body.data.task.title).toBe("Write report");

    const fetched = await request(app)
      .get(`/api/tasks/${created.body.data.task.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(fetched.status).toBe(200);
  });

  it("rejects a task with no title", async () => {
    const token = await registerAndGetToken(app);
    const res = await createTask(token, { priority: "P2" });
    expect(res.status).toBe(400);
  });

  it("lists tasks filtered by status", async () => {
    const token = await registerAndGetToken(app);
    await createTask(token, { title: "A", status: "todo" });
    await createTask(token, { title: "B", status: "done" });

    const res = await request(app).get("/api/tasks?status=done").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0].title).toBe("B");
  });

  it("completes a task with no dependencies", async () => {
    const token = await registerAndGetToken(app);
    const created = await createTask(token, { title: "Simple" });
    const res = await request(app)
      .post(`/api/tasks/${created.body.data.task.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe("done");
  });

  it("warns instead of completing when a dependency is unfinished, then allows override", async () => {
    const token = await registerAndGetToken(app);
    const blocker = await createTask(token, { title: "Blocker" });
    const blocked = await createTask(token, {
      title: "Blocked",
      dependsOn: [blocker.body.data.task.id],
    });

    const attempt = await request(app)
      .post(`/api/tasks/${blocked.body.data.task.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(attempt.body.data.warning).toBe("BLOCKED_BY_INCOMPLETE_DEPENDENCIES");
    expect(attempt.body.data.unfinishedDependencies).toHaveLength(1);

    const override = await request(app)
      .post(`/api/tasks/${blocked.body.data.task.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({ overrideDependencyWarning: true });
    expect(override.body.data.task.status).toBe("done");
  });

  it("spawns the next occurrence for a spawn-mode recurring task on complete", async () => {
    const token = await registerAndGetToken(app);
    const created = await createTask(token, {
      title: "Daily standup",
      dueAt: "2026-03-05T09:00:00.000Z",
      recurrence: { freq: "daily", interval: 1, mode: "spawn" },
    });
    const res = await request(app)
      .post(`/api/tasks/${created.body.data.task.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.body.data.spawnedNext).toBeTruthy();
    expect(res.body.data.spawnedNext.dueAt).toBe("2026-03-06T09:00:00.000Z");
  });

  it("duplicates a task", async () => {
    const token = await registerAndGetToken(app);
    const created = await createTask(token, { title: "Original" });
    const dup = await request(app)
      .post(`/api/tasks/${created.body.data.task.id}/duplicate`)
      .set("Authorization", `Bearer ${token}`);
    expect(dup.status).toBe(201);
    expect(dup.body.data.task.title).toBe("Original (copy)");
  });

  it("applies a batch update across multiple tasks", async () => {
    const token = await registerAndGetToken(app);
    const a = await createTask(token, { title: "A" });
    const b = await createTask(token, { title: "B" });

    const res = await request(app)
      .post("/api/tasks/batch")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [a.body.data.task.id, b.body.data.task.id], set: { status: "in-progress" } });
    expect(res.body.data.modified).toBe(2);

    const list = await request(app).get("/api/tasks?status=in-progress").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.tasks).toHaveLength(2);
  });

  it("creates a task via quick-add, resolving labels and priority", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/tasks/quick-add")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "pay bill tomorrow 5pm p1 #home" });
    expect(res.status).toBe(201);
    expect(res.body.data.task.title).toBe("pay bill");
    expect(res.body.data.task.priority).toBe("P1");
    expect(res.body.data.task.labels).toHaveLength(1);

    const labels = await request(app).get("/api/labels").set("Authorization", `Bearer ${token}`);
    expect(labels.body.data.labels.map((l: { name: string }) => l.name)).toContain("home");
  });

  it("adds a comment to a task", async () => {
    const token = await registerAndGetToken(app);
    const created = await createTask(token, { title: "With comment" });
    const res = await request(app)
      .post(`/api/tasks/${created.body.data.task.id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "hello" });
    expect(res.status).toBe(201);
    expect(res.body.data.comments).toHaveLength(1);
  });

  it("404s completing a task that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "owner2@example.com");
    const tokenB = await registerAndGetToken(app, "intruder2@example.com");
    const created = await createTask(tokenA, { title: "Private" });
    const res = await request(app)
      .post(`/api/tasks/${created.body.data.task.id}/complete`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({});
    expect(res.status).toBe(404);
  });
});
