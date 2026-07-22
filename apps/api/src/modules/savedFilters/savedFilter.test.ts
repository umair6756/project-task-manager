import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("saved filters", () => {
  it("creates a filter and executes it against matching tasks", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "High prio", priority: "P1" });
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Low prio", priority: "P4" });

    const filter = await request(app)
      .post("/api/saved-filters")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "P1 only", query: { priority: ["P1"] } });
    expect(filter.status).toBe(201);

    const executed = await request(app)
      .get(`/api/saved-filters/${filter.body.data.filter.id}/execute`)
      .set("Authorization", `Bearer ${token}`);
    expect(executed.status).toBe(200);
    expect(executed.body.data.tasks).toHaveLength(1);
    expect(executed.body.data.tasks[0].title).toBe("High prio");
  });

  it("updates and deletes a saved filter", async () => {
    const token = await registerAndGetToken(app);
    const filter = await request(app)
      .post("/api/saved-filters")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Draft", query: {} });

    const updated = await request(app)
      .patch(`/api/saved-filters/${filter.body.data.filter.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ pinned: true });
    expect(updated.body.data.filter.pinned).toBe(true);

    const del = await request(app)
      .delete(`/api/saved-filters/${filter.body.data.filter.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  it("404s executing a filter that doesn't exist", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .get("/api/saved-filters/000000000000000000000000/execute")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
