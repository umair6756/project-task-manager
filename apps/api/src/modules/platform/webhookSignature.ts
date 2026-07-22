// WHAT: HMAC-SHA256 request signing for outgoing webhooks, so the receiver
// can verify the payload actually came from FlowForge and wasn't tampered
// with in transit. Pure function — no I/O — so it's trivially unit-tested.
import crypto from "node:crypto";

export function signWebhookPayload(secret: string, rawBody: string): string {
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return `sha256=${hmac}`;
}

export function verifyWebhookSignature(secret: string, rawBody: string, signature: string): boolean {
  const expected = signWebhookPayload(secret, rawBody);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
