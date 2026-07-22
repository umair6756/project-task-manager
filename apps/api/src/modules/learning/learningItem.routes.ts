import { Router } from "express";
import { createLearningItemSchema, updateLearningItemSchema, progressUpdateSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listLearningItemsHandler,
  createLearningItemHandler,
  getLearningItemHandler,
  updateLearningItemHandler,
  deleteLearningItemHandler,
  updateProgressHandler,
  statsHandler,
} from "./learningItem.controller.js";

export const learningItemRouter = Router();
learningItemRouter.use(requireAuth);

/**
 * @openapi
 * /learning-items:
 *   get:
 *     tags: [Learning]
 *     summary: List learning items (filterable by status)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of learning items }
 *   post:
 *     tags: [Learning]
 *     summary: Create a learning item
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Learning item created }
 */
learningItemRouter.get("/", asyncHandler(listLearningItemsHandler));
learningItemRouter.post("/", validate(createLearningItemSchema), asyncHandler(createLearningItemHandler));

/**
 * @openapi
 * /learning-items/stats:
 *   get:
 *     tags: [Learning]
 *     summary: Items-by-status counts + learning streak
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats }
 */
learningItemRouter.get("/stats", asyncHandler(statsHandler));

/**
 * @openapi
 * /learning-items/{id}:
 *   get:
 *     tags: [Learning]
 *     summary: Get a learning item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Learning item }
 *   patch:
 *     tags: [Learning]
 *     summary: Update a learning item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated learning item }
 *   delete:
 *     tags: [Learning]
 *     summary: Soft-delete a learning item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
learningItemRouter.get("/:id", asyncHandler(getLearningItemHandler));
learningItemRouter.patch("/:id", validate(updateLearningItemSchema), asyncHandler(updateLearningItemHandler));
learningItemRouter.delete("/:id", asyncHandler(deleteLearningItemHandler));

/**
 * @openapi
 * /learning-items/{id}/progress:
 *   post:
 *     tags: [Learning]
 *     summary: Append a progress update (auto-transitions status)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [value]
 *             properties:
 *               value: { type: number }
 *               note: { type: string }
 *     responses:
 *       200: { description: Updated learning item }
 */
learningItemRouter.post("/:id/progress", validate(progressUpdateSchema), asyncHandler(updateProgressHandler));
