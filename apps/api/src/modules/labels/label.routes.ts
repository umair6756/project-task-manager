import { Router } from "express";
import { createLabelSchema, updateLabelSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listLabelsHandler,
  createLabelHandler,
  updateLabelHandler,
  deleteLabelHandler,
} from "./label.controller.js";

export const labelRouter = Router();
labelRouter.use(requireAuth);

/**
 * @openapi
 * /labels:
 *   get:
 *     tags: [Labels]
 *     summary: List labels
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of labels }
 *   post:
 *     tags: [Labels]
 *     summary: Create a label
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Label created }
 */
labelRouter.get("/", asyncHandler(listLabelsHandler));
labelRouter.post("/", validate(createLabelSchema), asyncHandler(createLabelHandler));

/**
 * @openapi
 * /labels/{id}:
 *   patch:
 *     tags: [Labels]
 *     summary: Update a label
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated label }
 *   delete:
 *     tags: [Labels]
 *     summary: Soft-delete a label
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Label moved to trash }
 */
labelRouter.patch("/:id", validate(updateLabelSchema), asyncHandler(updateLabelHandler));
labelRouter.delete("/:id", asyncHandler(deleteLabelHandler));
