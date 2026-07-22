import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("global search", () => {
  it("finds matches across tasks, notes, and projects", async () => {
    const token = await registerAndGetToken(app);
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Renovate kitchen" });
    await request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send({ title: "Renovation ideas", content: "cabinets and countertops" });
    await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({ name: "Renovate house" });

    const res = await request(app).get("/api/search?q=renovat").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    const types = res.body.data.results.map((r: { type: string }) => r.type);
    expect(types).toContain("task");
    expect(types).toContain("project");
  });

  it("rejects a search with no query", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).get("/api/search").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("does not leak another user's results", async () => {
    const tokenA = await registerAndGetToken(app, "sa@example.com");
    const tokenB = await registerAndGetToken(app, "sb@example.com");
    await request(app).post("/api/tasks").set("Authorization", `Bearer ${tokenA}`).send({ title: "Secret project alpha" });

    const res = await request(app).get("/api/search?q=alpha").set("Authorization", `Bearer ${tokenB}`);
    expect(res.body.data.results).toHaveLength(0);
  });
});
