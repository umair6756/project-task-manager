import request from "supertest";
import type { Express } from "express";

export async function registerAndGetToken(app: Express, email = "test@example.com"): Promise<string> {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "password123", name: "Test User" });
  return res.body.data.accessToken as string;
}
