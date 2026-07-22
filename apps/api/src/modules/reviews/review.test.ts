import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("reviews module", () => {
  it("builds a weekly review package and saves reflection answers", async () => {
    const token = await registerAndGetToken(app);
    const task = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Do it" });
    await request(app).post(`/api/tasks/${task.body.data.task.id}/complete`).set("Authorization", `Bearer ${token}`).send({});

    const isoWeek = "2026-W10";
    const pkg = await request(app).get(`/api/reviews/week/${isoWeek}`).set("Authorization", `Bearer ${token}`);
    expect(pkg.status).toBe(200);
    expect(pkg.body.data.prompts.length).toBeGreaterThan(0);
    expect(pkg.body.data.savedAnswers).toBeNull();

    const saved = await request(app)
      .post(`/api/reviews/week/${isoWeek}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ wentWell: "shipped a lot", lessons: "plan better" });
    expect(saved.status).toBe(200);

    const refetched = await request(app).get(`/api/reviews/week/${isoWeek}`).set("Authorization", `Bearer ${token}`);
    expect(refetched.body.data.savedAnswers.wentWell).toBe("shipped a lot");
  });

  it("rejects a malformed ISO week", () => {
    return registerAndGetToken(app).then((token) =>
      request(app).get("/api/reviews/week/not-a-week").set("Authorization", `Bearer ${token}`).then((res) => {
        expect(res.status).toBe(400);
      }),
    );
  });

  it("builds monthly and year-in-review packages", async () => {
    const token = await registerAndGetToken(app);
    const monthly = await request(app).get("/api/reviews/month/2026-03").set("Authorization", `Bearer ${token}`);
    expect(monthly.status).toBe(200);

    const yearly = await request(app).get("/api/reviews/year/2026").set("Authorization", `Bearer ${token}`);
    expect(yearly.status).toBe(200);
    expect(yearly.body.data.year).toBe(2026);
  });
});
