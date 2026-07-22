import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("labels module", () => {
  it("creates, updates, and soft-deletes a label", async () => {
    const token = await registerAndGetToken(app);
    const create = await request(app)
      .post("/api/labels")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "urgent", color: "#f00" });
    expect(create.status).toBe(201);

    const update = await request(app)
      .patch(`/api/labels/${create.body.data.label.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ color: "#0f0" });
    expect(update.status).toBe(200);
    expect(update.body.data.label.color).toBe("#0f0");

    const del = await request(app)
      .delete(`/api/labels/${create.body.data.label.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const list = await request(app).get("/api/labels").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.labels).toHaveLength(0);
  });

  it("rejects duplicate label names for the same user", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/labels").set("Authorization", `Bearer ${token}`).send({ name: "home" });
    const dup = await request(app).post("/api/labels").set("Authorization", `Bearer ${token}`).send({ name: "home" });
    expect(dup.status).toBe(409); // duplicate key (userId+name unique index) -> 409
  });

  it("returns 404 deleting a label that doesn't exist", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .delete("/api/labels/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
