import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("areas module", () => {
  it("creates and lists areas", async () => {
    const token = await registerAndGetToken(app);
    const create = await request(app)
      .post("/api/areas")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Work", color: "#ff0000" });
    expect(create.status).toBe(201);
    expect(create.body.data.area.name).toBe("Work");

    const list = await request(app).get("/api/areas").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.areas).toHaveLength(1);
  });

  it("rejects area creation without a name", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/areas")
      .set("Authorization", `Bearer ${token}`)
      .send({ color: "#ff0000" });
    expect(res.status).toBe(400);
  });

  it("reorders areas", async () => {
    const token = await registerAndGetToken(app);
    const a = await request(app).post("/api/areas").set("Authorization", `Bearer ${token}`).send({ name: "A" });
    const b = await request(app).post("/api/areas").set("Authorization", `Bearer ${token}`).send({ name: "B" });

    const reorder = await request(app)
      .post("/api/areas/reorder")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderedIds: [b.body.data.area.id, a.body.data.area.id] });
    expect(reorder.status).toBe(200);
    expect(reorder.body.data.areas[0].name).toBe("B");
  });

  it("soft-deletes an area and it disappears from the list", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/areas")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ToDelete" });

    const del = await request(app)
      .delete(`/api/areas/${created.body.data.area.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const list = await request(app).get("/api/areas").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.areas).toHaveLength(0);
  });

  it("returns 404 updating an area that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "a@example.com");
    const tokenB = await registerAndGetToken(app, "b@example.com");
    const created = await request(app)
      .post("/api/areas")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Mine" });

    const res = await request(app)
      .patch(`/api/areas/${created.body.data.area.id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ name: "Hijacked" });
    expect(res.status).toBe(404);
  });
});
