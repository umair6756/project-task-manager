import { Router } from "express";
import { reportsRangeQuerySchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  timeByProjectHandler,
  timeByLabelHandler,
  timeByAreaHandler,
  dailyTimelineHandler,
  estimatesVsActualsHandler,
  areaBudgetsHandler,
  deepWorkHeatHandler,
} from "./reports.controller.js";

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

/**
 * @openapi
 * /reports/time-by-project:
 *   get:
 *     tags: [Reports]
 *     summary: Time tracked grouped by project, for a date range
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Minutes by project }
 * /reports/time-by-label:
 *   get:
 *     tags: [Reports]
 *     summary: Time tracked grouped by label, for a date range
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Minutes by label }
 * /reports/time-by-area:
 *   get:
 *     tags: [Reports]
 *     summary: Time tracked grouped by area, for a date range
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Minutes by area }
 * /reports/daily-timeline:
 *   get:
 *     tags: [Reports]
 *     summary: Raw time entries for a date range, chronological
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Time entries }
 * /reports/deep-work-heat:
 *   get:
 *     tags: [Reports]
 *     summary: Minutes tracked bucketed by hour-of-day
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Minutes by hour (0-23) }
 */
reportsRouter.get("/time-by-project", validate(reportsRangeQuerySchema, "query"), asyncHandler(timeByProjectHandler));
reportsRouter.get("/time-by-label", validate(reportsRangeQuerySchema, "query"), asyncHandler(timeByLabelHandler));
reportsRouter.get("/time-by-area", validate(reportsRangeQuerySchema, "query"), asyncHandler(timeByAreaHandler));
reportsRouter.get("/daily-timeline", validate(reportsRangeQuerySchema, "query"), asyncHandler(dailyTimelineHandler));
reportsRouter.get("/deep-work-heat", validate(reportsRangeQuerySchema, "query"), asyncHandler(deepWorkHeatHandler));

/**
 * @openapi
 * /reports/estimates-vs-actuals/{projectId}:
 *   get:
 *     tags: [Reports]
 *     summary: Estimated vs actual tracked minutes for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Estimate vs actual minutes }
 * /reports/area-budgets:
 *   get:
 *     tags: [Reports]
 *     summary: Weekly area time budgets vs consumed (from user.settings.areaBudgets)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Budget consumption report }
 */
reportsRouter.get("/estimates-vs-actuals/:projectId", asyncHandler(estimatesVsActualsHandler));
reportsRouter.get("/area-budgets", asyncHandler(areaBudgetsHandler));
