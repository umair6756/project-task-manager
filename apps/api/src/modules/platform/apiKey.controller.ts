import type { Request, Response } from "express";
import { ApiKey } from "./apiKey.model.js";
import { createApiKey } from "./apiKey.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listApiKeysHandler(req: Request, res: Response): Promise<void> {
  const keys = await ApiKey.find({ userId: req.userId }).select("-keyHash").sort({ createdAt: -1 });
  ok(res, { keys });
}

export async function createApiKeyHandler(req: Request, res: Response): Promise<void> {
  const { name, scopes } = req.body as { name: string; scopes?: string[] };
  const { apiKey, rawKey } = await createApiKey(req.userId as string, name, scopes ?? ["read", "write"]);
  // rawKey is only ever shown once, at creation time.
  ok(res, { apiKey: { id: apiKey.id, name: apiKey.name, scopes: apiKey.scopes }, rawKey }, 201);
}

export async function revokeApiKeyHandler(req: Request, res: Response): Promise<void> {
  const key = await ApiKey.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { new: true },
  );
  if (!key) throw AppError.notFound("API key not found");
  ok(res, { revoked: true });
}
