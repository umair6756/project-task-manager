import { describe, it, expect } from "vitest";
import { signWebhookPayload, verifyWebhookSignature } from "./webhookSignature.js";

describe("webhook signing", () => {
  it("verifies a signature produced with the same secret", () => {
    const sig = signWebhookPayload("secret1", '{"a":1}');
    expect(verifyWebhookSignature("secret1", '{"a":1}', sig)).toBe(true);
  });

  it("rejects a signature produced with a different secret", () => {
    const sig = signWebhookPayload("secret1", '{"a":1}');
    expect(verifyWebhookSignature("secret2", '{"a":1}', sig)).toBe(false);
  });

  it("rejects a signature when the body has been tampered with", () => {
    const sig = signWebhookPayload("secret1", '{"a":1}');
    expect(verifyWebhookSignature("secret1", '{"a":2}', sig)).toBe(false);
  });

  it("produces a deterministic signature for the same input", () => {
    const sig1 = signWebhookPayload("secret1", '{"a":1}');
    const sig2 = signWebhookPayload("secret1", '{"a":1}');
    expect(sig1).toBe(sig2);
  });
});
