import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  todayScoreHandler,
  scoreHistoryHandler,
  trendsHandler,
  projectBurndownHandler,
  projectCfdHandler,
} from "./analytics.controller.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

/**
 * @openapi
 * /analytics/score/today:
 *   get:
 *     tags: [Analytics]
 *     summary: Today's productivity score breakdown
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Score breakdown }
 * /analytics/score/history:
 *   get:
 *     tags: [Analytics]
 *     summary: Historical daily scores over a range
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Score history }
 * /analytics/trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Velocity, completion/overdue rates, best hours, procrastination, personal records
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Trends data }
 */
analyticsRouter.get("/score/today", asyncHandler(todayScoreHandler));
analyticsRouter.get("/score/history", asyncHandler(scoreHistoryHandler));
analyticsRouter.get("/trends", asyncHandler(trendsHandler));

/**
 * @openapi
 * /analytics/projects/{projectId}/burndown:
 *   get:
 *     tags: [Analytics]
 *     summary: Project burndown (remaining open tasks per day)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Burndown data }
 * /analytics/projects/{projectId}/cfd:
 *   get:
 *     tags: [Analytics]
 *     summary: Project cumulative flow diagram (simplified open/done)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: CFD data }
 */
analyticsRouter.get("/projects/:projectId/burndown", asyncHandler(projectBurndownHandler));
analyticsRouter.get("/projects/:projectId/cfd", asyncHandler(projectCfdHandler));
