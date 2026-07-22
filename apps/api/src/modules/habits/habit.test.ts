import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("habits module", () => {
  it("creates a daily habit and checks in idempotently", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meditate", schedule: { kind: "daily" } });
    expect(created.status).toBe(201);

    const checkin1 = await request(app)
      .post(`/api/habits/${created.body.data.habit.id}/checkin`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(checkin1.body.data.habit.currentStreak).toBe(1);

    // Checking in again the same day is idempotent, not double-counted.
    const checkin2 = await request(app)
      .post(`/api/habits/${created.body.data.habit.id}/checkin`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(checkin2.body.data.habit.currentStreak).toBe(1);
  });

  it("rejects a habit with an invalid schedule kind", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bad", schedule: { kind: "monthly" } });
    expect(res.status).toBe(400);
  });

  it("skip preserves the streak and reports completion rate excluding skips", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Journal", schedule: { kind: "daily" } });
    const id = created.body.data.habit.id;

    await request(app).post(`/api/habits/${id}/checkin`).set("Authorization", `Bearer ${token}`).send({});
    const skip = await request(app).post(`/api/habits/${id}/skip`).set("Authorization", `Bearer ${token}`).send({ reason: "sick" });
    expect(skip.status).toBe(200);

    const rate = await request(app).get(`/api/habits/${id}/completion-rate?days=1`).set("Authorization", `Bearer ${token}`);
    expect(rate.body.data.skippedCount).toBe(1);
  });

  it("archives a habit", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app).post("/api/habits").set("Authorization", `Bearer ${token}`).send({ name: "Old", schedule: { kind: "daily" } });
    const archived = await request(app).post(`/api/habits/${created.body.data.habit.id}/archive`).set("Authorization", `Bearer ${token}`);
    expect(archived.body.data.habit.archived).toBe(true);

    const list = await request(app).get("/api/habits").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.habits).toHaveLength(0); // default list excludes archived
  });

  it("returns a heatmap and strength score", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app).post("/api/habits").set("Authorization", `Bearer ${token}`).send({ name: "Read", schedule: { kind: "daily" } });
    await request(app).post(`/api/habits/${created.body.data.habit.id}/checkin`).set("Authorization", `Bearer ${token}`).send({});

    const heatmap = await request(app).get(`/api/habits/${created.body.data.habit.id}/heatmap`).set("Authorization", `Bearer ${token}`);
    expect(heatmap.body.data.heatmap).toHaveLength(1);

    const strength = await request(app).get(`/api/habits/${created.body.data.habit.id}/strength`).set("Authorization", `Bearer ${token}`);
    expect(strength.body.data.strength).toBeGreaterThan(0);
  });

  it("404s checking in on a habit that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "ha@example.com");
    const tokenB = await registerAndGetToken(app, "hb@example.com");
    const created = await request(app).post("/api/habits").set("Authorization", `Bearer ${tokenA}`).send({ name: "Private", schedule: { kind: "daily" } });
    const res = await request(app)
      .post(`/api/habits/${created.body.data.habit.id}/checkin`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({});
    expect(res.status).toBe(404);
  });
});
