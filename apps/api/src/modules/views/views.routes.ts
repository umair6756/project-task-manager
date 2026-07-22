import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  todayViewHandler,
  upcomingViewHandler,
  inboxViewHandler,
  anytimeViewHandler,
} from "./views.controller.js";

export const viewsRouter = Router();
viewsRouter.use(requireAuth);

/**
 * @openapi
 * /views/today:
 *   get:
 *     tags: [Views]
 *     summary: Overdue + due-today + starting-today tasks (timezone/day-end-hour aware)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Today view }
 * /views/upcoming:
 *   get:
 *     tags: [Views]
 *     summary: Tasks due within the next N days (default 7)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, minimum: 1, maximum: 30 }
 *     responses:
 *       200: { description: Upcoming view }
 * /views/inbox:
 *   get:
 *     tags: [Views]
 *     summary: Open tasks with no project assigned
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Inbox view }
 * /views/anytime:
 *   get:
 *     tags: [Views]
 *     summary: Open tasks with no due/start date
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Anytime view }
 */
viewsRouter.get("/today", asyncHandler(todayViewHandler));
viewsRouter.get("/upcoming", asyncHandler(upcomingViewHandler));
viewsRouter.get("/inbox", asyncHandler(inboxViewHandler));
viewsRouter.get("/anytime", asyncHandler(anytimeViewHandler));
