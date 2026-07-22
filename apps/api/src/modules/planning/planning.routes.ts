import { Router } from "express";
import { updatePlanNotesSchema, setMitsSchema, shutdownSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getDailyPlanHandler,
  updatePlanNotesHandler,
  setMitsHandler,
  shutdownHandler,
} from "./planning.controller.js";

export const planningRouter = Router();
planningRouter.use(requireAuth);

/**
 * @openapi
 * /planning/daily:
 *   get:
 *     tags: [Planning]
 *     summary: Get-or-create today's daily plan (MITs + notes + shutdown state)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Today's daily plan }
 *   patch:
 *     tags: [Planning]
 *     summary: Update today's morning plan notes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated plan }
 */
planningRouter.get("/daily", asyncHandler(getDailyPlanHandler));
planningRouter.patch("/daily", validate(updatePlanNotesSchema), asyncHandler(updatePlanNotesHandler));

/**
 * @openapi
 * /planning/mits:
 *   put:
 *     tags: [Planning]
 *     summary: Set today's Most Important Tasks (up to 3)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated plan }
 */
planningRouter.put("/mits", validate(setMitsSchema), asyncHandler(setMitsHandler));

/**
 * @openapi
 * /planning/shutdown:
 *   post:
 *     tags: [Planning]
 *     summary: Complete today's shutdown ritual
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated plan, shutdownDone true }
 */
planningRouter.post("/shutdown", validate(shutdownSchema), asyncHandler(shutdownHandler));
