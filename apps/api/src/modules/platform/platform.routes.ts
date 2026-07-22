import { Router } from "express";
import { createApiKeySchema, createWebhookSchema, updateWebhookSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { exportDataHandler, importDataHandler } from "./platform.controller.js";
import { listApiKeysHandler, createApiKeyHandler, revokeApiKeyHandler } from "./apiKey.controller.js";
import {
  listWebhooksHandler,
  createWebhookHandler,
  updateWebhookHandler,
  deleteWebhookHandler,
  listDeliveriesHandler,
} from "./webhook.controller.js";

export const platformRouter = Router();
platformRouter.use(requireAuth);

/**
 * @openapi
 * /platform/export:
 *   get:
 *     tags: [Platform]
 *     summary: Download a full JSON export of all your data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: JSON export file }
 * /platform/import:
 *   post:
 *     tags: [Platform]
 *     summary: Import a previously exported JSON blob (ids remapped, never collide with existing data)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Import summary (counts per collection) }
 */
platformRouter.get("/export", asyncHandler(exportDataHandler));
platformRouter.post("/import", asyncHandler(importDataHandler));

/**
 * @openapi
 * /platform/api-keys:
 *   get:
 *     tags: [Platform]
 *     summary: List your API keys (hash never returned)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of API keys }
 *   post:
 *     tags: [Platform]
 *     summary: Create an API key (raw key returned once, never again)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created key + one-time raw value }
 */
platformRouter.get("/api-keys", asyncHandler(listApiKeysHandler));
platformRouter.post("/api-keys", validate(createApiKeySchema), asyncHandler(createApiKeyHandler));

/**
 * @openapi
 * /platform/api-keys/{id}:
 *   delete:
 *     tags: [Platform]
 *     summary: Revoke an API key
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Revoked }
 */
platformRouter.delete("/api-keys/:id", asyncHandler(revokeApiKeyHandler));

/**
 * @openapi
 * /platform/webhooks:
 *   get:
 *     tags: [Platform]
 *     summary: List webhooks (secret never returned)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of webhooks }
 *   post:
 *     tags: [Platform]
 *     summary: Create a webhook (HMAC secret returned once)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created webhook + one-time secret }
 */
platformRouter.get("/webhooks", asyncHandler(listWebhooksHandler));
platformRouter.post("/webhooks", validate(createWebhookSchema), asyncHandler(createWebhookHandler));

/**
 * @openapi
 * /platform/webhooks/{id}:
 *   patch:
 *     tags: [Platform]
 *     summary: Update a webhook
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated webhook }
 *   delete:
 *     tags: [Platform]
 *     summary: Delete a webhook
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 * /platform/webhooks/{id}/deliveries:
 *   get:
 *     tags: [Platform]
 *     summary: List recent delivery attempts for a webhook
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Delivery attempts }
 */
platformRouter.patch("/webhooks/:id", validate(updateWebhookSchema), asyncHandler(updateWebhookHandler));
platformRouter.delete("/webhooks/:id", asyncHandler(deleteWebhookHandler));
platformRouter.get("/webhooks/:id/deliveries", asyncHandler(listDeliveriesHandler));
