import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("skills module", () => {
  it("creates a skill and returns it in the radar endpoint", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Node.js", level: 3, category: "Backend" });
    expect(created.status).toBe(201);

    const radar = await request(app).get("/api/skills/radar").set("Authorization", `Bearer ${token}`);
    expect(radar.body.data.radar).toHaveLength(1);
    expect(radar.body.data.radar[0]).toMatchObject({ name: "Node.js", level: 3 });
  });

  it("rejects a level outside 1-5", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).post("/api/skills").set("Authorization", `Bearer ${token}`).send({ name: "X", level: 9 });
    expect(res.status).toBe(400);
  });

  it("updates and soft-deletes a skill", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app).post("/api/skills").set("Authorization", `Bearer ${token}`).send({ name: "Go" });
    const updated = await request(app)
      .patch(`/api/skills/${created.body.data.skill.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ level: 4 });
    expect(updated.body.data.skill.level).toBe(4);

    const del = await request(app).delete(`/api/skills/${created.body.data.skill.id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
  });
});
