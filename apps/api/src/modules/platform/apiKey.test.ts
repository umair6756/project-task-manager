import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("API keys module", () => {
  it("creates a key and uses it to authenticate instead of a JWT", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/platform/api-keys")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "CLI script" });
    expect(created.status).toBe(201);
    const rawKey = created.body.data.rawKey;
    expect(rawKey).toMatch(/^ffk_/);

    const res = await request(app).get("/api/tasks").set("X-API-Key", rawKey);
    expect(res.status).toBe(200);
  });

  it("rejects an invalid API key", async () => {
    const res = await request(app).get("/api/tasks").set("X-API-Key", "not-a-real-key");
    expect(res.status).toBe(401);
  });

  it("revokes a key so it can no longer authenticate", async () => {
    const token = await registerAndGetToken(app);
    const created = await request(app)
      .post("/api/platform/api-keys")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Temp" });

    await request(app).delete(`/api/platform/api-keys/${created.body.data.apiKey.id}`).set("Authorization", `Bearer ${token}`);

    const res = await request(app).get("/api/tasks").set("X-API-Key", created.body.data.rawKey);
    expect(res.status).toBe(401);
  });

  it("never returns the key hash in the list endpoint", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/platform/api-keys").set("Authorization", `Bearer ${token}`).send({ name: "X" });
    const list = await request(app).get("/api/platform/api-keys").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.keys[0].keyHash).toBeUndefined();
  });
});
