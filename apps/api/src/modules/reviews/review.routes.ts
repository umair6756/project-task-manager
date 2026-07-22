import { Router } from "express";
import { saveWeeklyReviewSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getWeeklyReviewHandler,
  saveWeeklyReviewHandler,
  getMonthlyReviewHandler,
  getYearInReviewHandler,
} from "./review.controller.js";

export const reviewRouter = Router();
reviewRouter.use(requireAuth);

/**
 * @openapi
 * /reviews/week/{isoWeek}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get the aggregated weekly review package (YYYY-Www)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: isoWeek
 *         required: true
 *         schema: { type: string, example: "2026-W10" }
 *     responses:
 *       200: { description: Weekly review package }
 *   post:
 *     tags: [Reviews]
 *     summary: Save the user's weekly review answers
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: isoWeek
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Saved review answers }
 */
reviewRouter.get("/week/:isoWeek", asyncHandler(getWeeklyReviewHandler));
reviewRouter.post("/week/:isoWeek", validate(saveWeeklyReviewSchema), asyncHandler(saveWeeklyReviewHandler));

/**
 * @openapi
 * /reviews/month/{yearMonth}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get the aggregated monthly review package (YYYY-MM)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: yearMonth
 *         required: true
 *         schema: { type: string, example: "2026-03" }
 *     responses:
 *       200: { description: Monthly review package }
 * /reviews/year/{year}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get the aggregated year-in-review package
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema: { type: integer, example: 2026 }
 *     responses:
 *       200: { description: Year-in-review package }
 */
reviewRouter.get("/month/:yearMonth", asyncHandler(getMonthlyReviewHandler));
reviewRouter.get("/year/:year", asyncHandler(getYearInReviewHandler));
