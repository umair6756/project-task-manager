import { Router } from "express";
import { createHabitSchema, updateHabitSchema, checkinHabitSchema, skipHabitSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listHabitsHandler,
  createHabitHandler,
  updateHabitHandler,
  archiveHabitHandler,
  deleteHabitHandler,
  checkinHandler,
  skipHandler,
  heatmapHandler,
  completionRateHandler,
  strengthHandler,
} from "./habit.controller.js";

export const habitRouter = Router();
habitRouter.use(requireAuth);

/**
 * @openapi
 * /habits:
 *   get:
 *     tags: [Habits]
 *     summary: List habits
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: archived
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of habits }
 *   post:
 *     tags: [Habits]
 *     summary: Create a habit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Habit created }
 */
habitRouter.get("/", asyncHandler(listHabitsHandler));
habitRouter.post("/", validate(createHabitSchema), asyncHandler(createHabitHandler));

/**
 * @openapi
 * /habits/{id}:
 *   patch:
 *     tags: [Habits]
 *     summary: Update a habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated habit }
 *   delete:
 *     tags: [Habits]
 *     summary: Soft-delete a habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
habitRouter.patch("/:id", validate(updateHabitSchema), asyncHandler(updateHabitHandler));
habitRouter.delete("/:id", asyncHandler(deleteHabitHandler));

/**
 * @openapi
 * /habits/{id}/archive:
 *   post:
 *     tags: [Habits]
 *     summary: Archive a habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Archived habit }
 * /habits/{id}/checkin:
 *   post:
 *     tags: [Habits]
 *     summary: Check in for today (idempotent per logical day)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated habit with refreshed streak }
 * /habits/{id}/skip:
 *   post:
 *     tags: [Habits]
 *     summary: Skip today with a reason (preserves the streak)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated habit with refreshed streak }
 */
habitRouter.post("/:id/archive", asyncHandler(archiveHabitHandler));
habitRouter.post("/:id/checkin", validate(checkinHabitSchema), asyncHandler(checkinHandler));
habitRouter.post("/:id/skip", validate(skipHabitSchema), asyncHandler(skipHandler));

/**
 * @openapi
 * /habits/{id}/heatmap:
 *   get:
 *     tags: [Habits]
 *     summary: Year heatmap of logged days
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Heatmap data }
 * /habits/{id}/completion-rate:
 *   get:
 *     tags: [Habits]
 *     summary: Completion rate over the last N days (default 30)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: days
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Completion rate }
 * /habits/{id}/strength:
 *   get:
 *     tags: [Habits]
 *     summary: Weighted-recency strength score (0-100)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Strength score }
 */
habitRouter.get("/:id/heatmap", asyncHandler(heatmapHandler));
habitRouter.get("/:id/completion-rate", asyncHandler(completionRateHandler));
habitRouter.get("/:id/strength", asyncHandler(strengthHandler));
