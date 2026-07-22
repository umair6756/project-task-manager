import { Router } from "express";
import { createPomodoroSessionSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { startPomodoroHandler, completeCycleHandler, stopPomodoroHandler } from "./pomodoro.controller.js";

export const pomodoroRouter = Router();
pomodoroRouter.use(requireAuth);

/**
 * @openapi
 * /pomodoro:
 *   post:
 *     tags: [Time]
 *     summary: Start a pomodoro session
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Session started }
 */
pomodoroRouter.post("/", validate(createPomodoroSessionSchema), asyncHandler(startPomodoroHandler));

/**
 * @openapi
 * /pomodoro/{id}/complete-cycle:
 *   post:
 *     tags: [Time]
 *     summary: Log the completed work cycle as a time entry and advance
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated session }
 * /pomodoro/{id}/stop:
 *   post:
 *     tags: [Time]
 *     summary: Stop a pomodoro session early
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Session stopped }
 */
pomodoroRouter.post("/:id/complete-cycle", asyncHandler(completeCycleHandler));
pomodoroRouter.post("/:id/stop", asyncHandler(stopPomodoroHandler));
