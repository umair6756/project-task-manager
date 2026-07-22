import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("notebooks module", () => {
  it("creates a nested notebook hierarchy", async () => {
    const token = await registerAndGetToken(app);
    const parent = await request(app).post("/api/notebooks").set("Authorization", `Bearer ${token}`).send({ name: "Work" });
    const child = await request(app)
      .post("/api/notebooks")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Projects", parentId: parent.body.data.notebook.id });
    expect(child.status).toBe(201);
    expect(child.body.data.notebook.parentId).toBe(parent.body.data.notebook.id);
  });

  it("rejects a notebook with no name", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).post("/api/notebooks").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("soft-deletes a notebook", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app).post("/api/notebooks").set("Authorization", `Bearer ${token}`).send({ name: "Temp" });
    const del = await request(app).delete(`/api/notebooks/${created.body.data.notebook.id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const list = await request(app).get("/api/notebooks").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.notebooks).toHaveLength(0);
  });
});
