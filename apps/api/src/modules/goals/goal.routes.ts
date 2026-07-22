import { Router } from "express";
import {
  createGoalSchema,
  updateGoalSchema,
  archiveGoalSchema,
  createKeyResultSchema,
  updateKeyResultSchema,
  createGoalCheckInSchema,
} from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listGoalsHandler,
  createGoalHandler,
  getGoalHandler,
  updateGoalHandler,
  archiveGoalHandler,
  deleteGoalHandler,
  createKeyResultHandler,
  updateKeyResultHandler,
  deleteKeyResultHandler,
  createCheckInHandler,
  listCheckInsHandler,
} from "./goal.controller.js";

export const goalRouter = Router();
goalRouter.use(requireAuth);

/**
 * @openapi
 * /goals:
 *   get:
 *     tags: [Goals]
 *     summary: List goals (with computed roll-up progress + traffic light)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: horizon
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of goals }
 *   post:
 *     tags: [Goals]
 *     summary: Create a goal
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Goal created }
 */
goalRouter.get("/", asyncHandler(listGoalsHandler));
goalRouter.post("/", validate(createGoalSchema), asyncHandler(createGoalHandler));

/**
 * @openapi
 * /goals/{id}:
 *   get:
 *     tags: [Goals]
 *     summary: Get a goal with its key results
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Goal }
 *   patch:
 *     tags: [Goals]
 *     summary: Update a goal
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated goal }
 *   delete:
 *     tags: [Goals]
 *     summary: Soft-delete a goal
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
goalRouter.get("/:id", asyncHandler(getGoalHandler));
goalRouter.patch("/:id", validate(updateGoalSchema), asyncHandler(updateGoalHandler));
goalRouter.delete("/:id", asyncHandler(deleteGoalHandler));

/**
 * @openapi
 * /goals/{id}/archive:
 *   post:
 *     tags: [Goals]
 *     summary: Archive a goal with an outcome note
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Archived goal }
 */
goalRouter.post("/:id/archive", validate(archiveGoalSchema), asyncHandler(archiveGoalHandler));

/**
 * @openapi
 * /goals/{goalId}/key-results:
 *   post:
 *     tags: [Goals]
 *     summary: Create a key result under a goal (optionally auto-bound)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Key result created }
 */
goalRouter.post("/:goalId/key-results", validate(createKeyResultSchema), asyncHandler(createKeyResultHandler));

/**
 * @openapi
 * /goals/{goalId}/key-results/{keyResultId}:
 *   patch:
 *     tags: [Goals]
 *     summary: Update a key result
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: keyResultId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated key result }
 *   delete:
 *     tags: [Goals]
 *     summary: Delete a key result
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: keyResultId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
goalRouter.patch(
  "/:goalId/key-results/:keyResultId",
  validate(updateKeyResultSchema),
  asyncHandler(updateKeyResultHandler),
);
goalRouter.delete("/:goalId/key-results/:keyResultId", asyncHandler(deleteKeyResultHandler));

/**
 * @openapi
 * /goals/{goalId}/check-ins:
 *   get:
 *     tags: [Goals]
 *     summary: List check-ins for a goal
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of check-ins }
 *   post:
 *     tags: [Goals]
 *     summary: Record a check-in (optionally updating a key result's value)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Check-in recorded }
 */
goalRouter.get("/:goalId/check-ins", asyncHandler(listCheckInsHandler));
goalRouter.post("/:goalId/check-ins", validate(createGoalCheckInSchema), asyncHandler(createCheckInHandler));
