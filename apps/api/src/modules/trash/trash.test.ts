import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("trash module", () => {
  it("lists a soft-deleted area, restores it, then purges it", async () => {
    const token = await registerAndGetToken(app);
    const area = await request(app).post("/api/areas").set("Authorization", `Bearer ${token}`).send({ name: "Trashed" });
    await request(app).delete(`/api/areas/${area.body.data.area.id}`).set("Authorization", `Bearer ${token}`);

    const list = await request(app).get("/api/trash").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0].model).toBe("Area");

    const restore = await request(app)
      .post(`/api/trash/Area/${area.body.data.area.id}/restore`)
      .set("Authorization", `Bearer ${token}`);
    expect(restore.status).toBe(200);

    const afterRestore = await request(app).get("/api/areas").set("Authorization", `Bearer ${token}`);
    expect(afterRestore.body.data.areas).toHaveLength(1);

    await request(app).delete(`/api/areas/${area.body.data.area.id}`).set("Authorization", `Bearer ${token}`);
    const purge = await request(app)
      .delete(`/api/trash/Area/${area.body.data.area.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(purge.status).toBe(200);

    const afterPurge = await request(app).get("/api/trash").set("Authorization", `Bearer ${token}`);
    expect(afterPurge.body.data.items).toHaveLength(0);
  });

  it("rejects a non-trashable model name", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/trash/User/000000000000000000000000/restore")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("404s restoring an item that isn't in the trash", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/trash/Area/000000000000000000000000/restore")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
