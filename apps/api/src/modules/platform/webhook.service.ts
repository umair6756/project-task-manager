// WHAT: Queues webhook deliveries for a domain event, and delivers pending
// ones with up to 3 attempts (exponential-ish backoff: 1m, 5m, 30m) before
// giving up. Delivery itself is called from an Agenda job on a short
// interval, not synchronously from the event source — a webhook receiver
// being slow/down should never block the request that triggered the event.
import { Webhook, WebhookDelivery } from "./webhook.model.js";
import { signWebhookPayload } from "./webhookSignature.js";
import { logger } from "../../config/logger.js";

const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000];
const MAX_ATTEMPTS = 3;

export async function triggerWebhooks(userId: string, event: string, payload: Record<string, unknown>): Promise<void> {
  const webhooks = await Webhook.find({ userId, active: true, events: event });
  if (webhooks.length === 0) return;
  await WebhookDelivery.insertMany(
    webhooks.map((w) => ({ webhookId: w._id, event, payload, status: "pending", nextAttemptAt: new Date() })),
  );
}

export async function deliverPendingWebhooks(fetchImpl: typeof fetch = fetch): Promise<number> {
  const deliveries = await WebhookDelivery.find({
    status: "pending",
    nextAttemptAt: { $lte: new Date() },
  }).limit(50);

  let delivered = 0;
  for (const delivery of deliveries) {
    const webhook = await Webhook.findById(delivery.webhookId);
    if (!webhook || !webhook.active) {
      delivery.status = "failed";
      delivery.lastError = "Webhook no longer exists or is inactive";
      await delivery.save();
      continue;
    }

    const body = JSON.stringify({ event: delivery.event, payload: delivery.payload });
    const signature = signWebhookPayload(webhook.secret, body);

    try {
      const res = await fetchImpl(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-FlowForge-Signature": signature },
        body,
      });
      if (!res.ok) throw new Error(`Webhook receiver responded ${res.status}`);
      delivery.status = "delivered";
      delivered++;
    } catch (err) {
      delivery.attempts += 1;
      delivery.lastError = err instanceof Error ? err.message : String(err);
      if (delivery.attempts >= MAX_ATTEMPTS) {
        delivery.status = "failed";
        logger.warn({ webhookId: webhook._id, error: delivery.lastError }, "webhook delivery permanently failed");
      } else {
        delivery.nextAttemptAt = new Date(Date.now() + (RETRY_DELAYS_MS[delivery.attempts - 1] ?? 30 * 60_000));
      }
    }
    await delivery.save();
  }
  return delivered;
}
