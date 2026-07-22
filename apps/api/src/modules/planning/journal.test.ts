import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("journal module", () => {
  it("upserts today's journal entry idempotently", async () => {
    const token = await registerAndGetToken(app);
    const first = await request(app).post("/api/journal").set("Authorization", `Bearer ${token}`).send({ mood: 4, text: "good day" });
    expect(first.status).toBe(200);

    const second = await request(app).post("/api/journal").set("Authorization", `Bearer ${token}`).send({ mood: 5, text: "even better" });
    expect(second.body.data.entry.id).toBe(first.body.data.entry.id);
    expect(second.body.data.entry.mood).toBe(5);

    const list = await request(app).get("/api/journal").set("Authorization", `Bearer ${token}`);
    expect(list.body.data.entries).toHaveLength(1);
  });

  it("rejects a mood outside 1-5", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).post("/api/journal").set("Authorization", `Bearer ${token}`).send({ mood: 9 });
    expect(res.status).toBe(400);
  });

  it("returns null correlation with fewer than 2 data points", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/journal").set("Authorization", `Bearer ${token}`).send({ mood: 3 });
    const res = await request(app).get("/api/journal/mood-correlation").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.correlation).toBeNull();
  });
});
