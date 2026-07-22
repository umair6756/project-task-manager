import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("learning items module", () => {
  it("creates a learning item and updates progress, auto-transitioning status", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/learning-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "course", title: "Advanced TypeScript", progressUnit: "percent", progressTarget: 100 });
    expect(created.status).toBe(201);
    expect(created.body.data.item.status).toBe("wishlist");

    const progress = await request(app)
      .post(`/api/learning-items/${created.body.data.item.id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ value: 40, note: "finished module 1" });
    expect(progress.body.data.item.status).toBe("learning");
    expect(progress.body.data.item.progressHistory).toHaveLength(1);

    const complete = await request(app)
      .post(`/api/learning-items/${created.body.data.item.id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ value: 100 });
    expect(complete.body.data.item.status).toBe("completed");
    expect(complete.body.data.item.completedAt).toBeTruthy();
  });

  it("rejects an invalid type", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/learning-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "podcast", title: "X" });
    expect(res.status).toBe(400);
  });

  it("reports stats: items by status + learning streak", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/learning-items").set("Authorization", `Bearer ${token}`).send({ type: "book", title: "Book A" });
    const b = await request(app).post("/api/learning-items").set("Authorization", `Bearer ${token}`).send({ type: "book", title: "Book B" });
    await request(app).post(`/api/learning-items/${b.body.data.item.id}/progress`).set("Authorization", `Bearer ${token}`).send({ value: 10 });

    const stats = await request(app).get("/api/learning-items/stats").set("Authorization", `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.data.itemsByStatus.learning).toBe(1);
    expect(stats.body.data.itemsByStatus.wishlist).toBe(1);
    expect(stats.body.data.streak.current).toBe(1);
  });

  it("404s fetching a learning item that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "la@example.com");
    const tokenB = await registerAndGetToken(app, "lb@example.com");
    const created = await request(app).post("/api/learning-items").set("Authorization", `Bearer ${tokenA}`).send({ type: "book", title: "Private" });
    const res = await request(app).get(`/api/learning-items/${created.body.data.item.id}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});
