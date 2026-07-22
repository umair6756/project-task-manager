import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";

const app = createApp();

async function registerAndGetToken() {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email: "u@example.com", password: "password123", name: "User" });
  return res.body.data.accessToken as string;
}

describe("users module", () => {
  it("updates the profile", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name", timezone: "America/New_York", dayEndHour: 3 });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe("New Name");
    expect(res.body.data.user.timezone).toBe("America/New_York");
    expect(res.body.data.user.dayEndHour).toBe(3);
  });

  it("rejects profile update without auth", async () => {
    const res = await request(app).patch("/api/users/me").send({ name: "X" });
    expect(res.status).toBe(401);
  });

  it("gets and updates settings", async () => {
    const token = await registerAndGetToken();
    const put = await request(app)
      .put("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ theme: "dark", accent: "violet" });
    expect(put.status).toBe(200);
    expect(put.body.data.settings.theme).toBe("dark");

    const get = await request(app)
      .get("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.data.settings.accent).toBe("violet");
  });
});
