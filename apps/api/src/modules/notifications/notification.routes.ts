import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listNotificationsHandler, markReadHandler } from "./notification.controller.js";

export const notificationRouter = Router();
notificationRouter.use(requireAuth);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List recent notifications
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of notifications }
 * /notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Marked read }
 */
notificationRouter.get("/", asyncHandler(listNotificationsHandler));
notificationRouter.post("/:id/read", asyncHandler(markReadHandler));
