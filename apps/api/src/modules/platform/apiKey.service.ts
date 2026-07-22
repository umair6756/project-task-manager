import crypto from "node:crypto";
import { ApiKey, type ApiKeyDoc } from "./apiKey.model.js";

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export async function createApiKey(
  userId: string,
  name: string,
  scopes: string[],
): Promise<{ apiKey: ApiKeyDoc; rawKey: string }> {
  const rawKey = `ffk_${crypto.randomBytes(24).toString("hex")}`;
  const apiKey = await ApiKey.create({ userId, name, scopes, keyHash: hashKey(rawKey) });
  return { apiKey, rawKey };
}

export async function verifyApiKey(rawKey: string): Promise<ApiKeyDoc | null> {
  const apiKey = await ApiKey.findOne({ keyHash: hashKey(rawKey), revokedAt: null });
  if (!apiKey) return null;
  apiKey.lastUsedAt = new Date();
  await apiKey.save();
  return apiKey;
}
