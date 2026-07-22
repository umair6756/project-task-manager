import { Router } from "express";
import { spendStreakFreezeSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { meHandler, spendStreakFreezeHandler } from "./gamification.controller.js";

export const gamificationRouter = Router();
gamificationRouter.use(requireAuth);

/**
 * @openapi
 * /gamification/me:
 *   get:
 *     tags: [Gamification]
 *     summary: XP/level, earned + in-progress achievements, streak-freeze tokens
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Gamification state }
 */
gamificationRouter.get("/me", asyncHandler(meHandler));

/**
 * @openapi
 * /gamification/streak-freeze/spend:
 *   post:
 *     tags: [Gamification]
 *     summary: Spend a streak-freeze token to protect a habit's streak for a day
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [habitId]
 *             properties:
 *               habitId: { type: string }
 *               dateKey: { type: string, example: "2026-03-05" }
 *     responses:
 *       200: { description: Token spent }
 *       400: { description: No tokens available }
 */
gamificationRouter.post(
  "/streak-freeze/spend",
  validate(spendStreakFreezeSchema),
  asyncHandler(spendStreakFreezeHandler),
);
