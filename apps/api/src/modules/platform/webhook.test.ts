import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";
import { deliverPendingWebhooks } from "./webhook.service.js";
import { WebhookDelivery } from "./webhook.model.js";

const app = createApp();

afterEach(() => {
  vi.restoreAllMocks();
});

describe("webhooks module", () => {
  it("creates a webhook and queues a delivery when a matching event fires", async () => {
    const token = await registerAndGetToken(app);
    const webhook = await request(app)
      .post("/api/platform/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com/hook", events: ["task.completed"] });
    expect(webhook.status).toBe(201);
    expect(webhook.body.data.webhook.secret).toBeTruthy();

    const task = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "T" });
    await request(app).post(`/api/tasks/${task.body.data.task.id}/complete`).set("Authorization", `Bearer ${token}`).send({});

    const deliveries = await request(app)
      .get(`/api/platform/webhooks/${webhook.body.data.webhook.id}/deliveries`)
      .set("Authorization", `Bearer ${token}`);
    expect(deliveries.body.data.deliveries).toHaveLength(1);
    expect(deliveries.body.data.deliveries[0].status).toBe("pending");
  });

  it("delivers a pending webhook successfully and signs the payload", async () => {
    const token = await registerAndGetToken(app);
    await request(app)
      .post("/api/platform/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com/hook", events: ["task.completed"] });
    const task = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "T" });
    await request(app).post(`/api/tasks/${task.body.data.task.id}/complete`).set("Authorization", `Bearer ${token}`).send({});

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const delivered = await deliverPendingWebhooks(fetchMock as unknown as typeof fetch);
    expect(delivered).toBe(1);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["X-FlowForge-Signature"]).toMatch(/^sha256=/);

    const stored = await WebhookDelivery.find({});
    expect(stored[0]!.status).toBe("delivered");
  });

  it("retries on failure and marks failed after 3 attempts", async () => {
    const token = await registerAndGetToken(app);
    await request(app)
      .post("/api/platform/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com/hook", events: ["habit.done"] });
    const habit = await request(app).post("/api/habits").set("Authorization", `Bearer ${token}`).send({ name: "H", schedule: { kind: "daily" } });
    await request(app).post(`/api/habits/${habit.body.data.habit.id}/checkin`).set("Authorization", `Bearer ${token}`).send({});

    const failingFetch = vi.fn().mockRejectedValue(new Error("connection refused"));
    for (let i = 0; i < 3; i++) {
      await WebhookDelivery.updateMany({}, { $set: { nextAttemptAt: new Date() } });
      await deliverPendingWebhooks(failingFetch as unknown as typeof fetch);
    }

    const stored = await WebhookDelivery.find({});
    expect(stored[0]!.status).toBe("failed");
    expect(stored[0]!.attempts).toBe(3);
  });
});
