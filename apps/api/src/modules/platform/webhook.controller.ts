import type { Request, Response } from "express";
import crypto from "node:crypto";
import { Webhook, WebhookDelivery } from "./webhook.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listWebhooksHandler(req: Request, res: Response): Promise<void> {
  const webhooks = await Webhook.find({ userId: req.userId }).select("-secret").sort({ createdAt: -1 });
  ok(res, { webhooks });
}

export async function createWebhookHandler(req: Request, res: Response): Promise<void> {
  const secret = crypto.randomBytes(24).toString("hex");
  const webhook = await Webhook.create({ ...req.body, userId: req.userId, secret });
  ok(res, { webhook: { ...webhook.toObject(), secret } }, 201); // secret shown once
}

export async function updateWebhookHandler(req: Request, res: Response): Promise<void> {
  const webhook = await Webhook.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  ).select("-secret");
  if (!webhook) throw AppError.notFound("Webhook not found");
  ok(res, { webhook });
}

export async function deleteWebhookHandler(req: Request, res: Response): Promise<void> {
  const result = await Webhook.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw AppError.notFound("Webhook not found");
  ok(res, { deleted: true });
}

export async function listDeliveriesHandler(req: Request, res: Response): Promise<void> {
  const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.userId });
  if (!webhook) throw AppError.notFound("Webhook not found");
  const deliveries = await WebhookDelivery.find({ webhookId: webhook._id }).sort({ createdAt: -1 }).limit(50);
  ok(res, { deliveries });
}
