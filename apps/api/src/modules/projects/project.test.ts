import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("projects module", () => {
  it("creates a project with computed progress + health", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ship FlowForge", status: "active" });
    expect(res.status).toBe(201);
    expect(res.body.data.project.name).toBe("Ship FlowForge");
    expect(res.body.data.project.progress).toBe(0);
    expect(res.body.data.project.health).toBe("on-track"); // no deadline set
  });

  it("rejects an invalid status", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bad", status: "not-a-status" });
    expect(res.status).toBe(400);
  });

  it("lists projects filtered by status", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Active One", status: "active" });
    await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Idea One", status: "idea" });

    const res = await request(app)
      .get("/api/projects?status=active")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.data.projects).toHaveLength(1);
    expect(res.body.data.projects[0].name).toBe("Active One");
  });

  it("archives and restores a project", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Archive Me", status: "active" });
    const id = created.body.data.project.id;

    const archived = await request(app).post(`/api/projects/${id}/archive`).set("Authorization", `Bearer ${token}`);
    expect(archived.body.data.project.status).toBe("archived");

    const restored = await request(app).post(`/api/projects/${id}/restore`).set("Authorization", `Bearer ${token}`);
    expect(restored.body.data.project.status).toBe("active");
  });

  it("toggles pinned state", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Pin Me" });
    const id = created.body.data.project.id;

    const pinned = await request(app).post(`/api/projects/${id}/pin`).set("Authorization", `Bearer ${token}`);
    expect(pinned.body.data.project.pinned).toBe(true);

    const unpinned = await request(app).post(`/api/projects/${id}/pin`).set("Authorization", `Bearer ${token}`);
    expect(unpinned.body.data.project.pinned).toBe(false);
  });

  it("manages milestones under a project", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "With Milestones" });
    const projectId = project.body.data.project.id;

    const milestone = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Beta launch" });
    expect(milestone.status).toBe(201);

    const update = await request(app)
      .patch(`/api/projects/${projectId}/milestones/${milestone.body.data.milestone._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ done: true });
    expect(update.body.data.milestone.done).toBe(true);

    const list = await request(app)
      .get(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.body.data.milestones).toHaveLength(1);

    const del = await request(app)
      .delete(`/api/projects/${projectId}/milestones/${milestone.body.data.milestone._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  it("404s for milestones under someone else's project", async () => {
    const tokenA = await registerAndGetToken(app, "owner@example.com");
    const tokenB = await registerAndGetToken(app, "intruder@example.com");
    const project = await request(app).post("/api/projects").set("Authorization", `Bearer ${tokenA}`).send({ name: "Private" });

    const res = await request(app)
      .get(`/api/projects/${project.body.data.project.id}/milestones`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });

  it("saves a project as a template and instantiates it with date-shifted milestones", async () => {
    const token = await registerAndGetToken(app);
    const project = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Launch Playbook", deadline: "2026-01-10T00:00:00.000Z" });
    const projectId = project.body.data.project.id;

    await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Kickoff", dueDate: "2026-01-01T00:00:00.000Z" });

    const template = await request(app)
      .post(`/api/projects/${projectId}/save-template`)
      .set("Authorization", `Bearer ${token}`);
    expect(template.status).toBe(201);
    const templateId = template.body.data.template._id;

    const instantiated = await request(app)
      .post(`/api/projects/${templateId}/instantiate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Launch Playbook v2", newStartDate: "2026-03-10T00:00:00.000Z" });
    expect(instantiated.status).toBe(201);
    // delta = 2026-03-10 - 2026-01-10 = 59 days, applied to the milestone's due date too
    const newProjectId = instantiated.body.data.project.id;
    const milestones = await request(app)
      .get(`/api/projects/${newProjectId}/milestones`)
      .set("Authorization", `Bearer ${token}`);
    expect(milestones.body.data.milestones).toHaveLength(1);
    expect(new Date(milestones.body.data.milestones[0].dueDate).toISOString()).toBe(
      "2026-03-01T00:00:00.000Z",
    );
  });
});
