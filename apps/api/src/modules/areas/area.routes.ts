import { Router } from "express";
import { createAreaSchema, updateAreaSchema, reorderAreasSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listAreasHandler,
  createAreaHandler,
  updateAreaHandler,
  deleteAreaHandler,
  reorderAreasHandler,
} from "./area.controller.js";

export const areaRouter = Router();
areaRouter.use(requireAuth);

/**
 * @openapi
 * /areas:
 *   get:
 *     tags: [Areas]
 *     summary: List the current user's areas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of areas }
 *   post:
 *     tags: [Areas]
 *     summary: Create an area
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               icon: { type: string, nullable: true }
 *               color: { type: string }
 *               sortOrder: { type: integer }
 *     responses:
 *       201: { description: Area created }
 */
areaRouter.get("/", asyncHandler(listAreasHandler));
areaRouter.post("/", validate(createAreaSchema), asyncHandler(createAreaHandler));

/**
 * @openapi
 * /areas/reorder:
 *   post:
 *     tags: [Areas]
 *     summary: Persist a new manual sort order for areas
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderedIds]
 *             properties:
 *               orderedIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Areas in new order }
 */
areaRouter.post("/reorder", validate(reorderAreasSchema), asyncHandler(reorderAreasHandler));

/**
 * @openapi
 * /areas/{id}:
 *   patch:
 *     tags: [Areas]
 *     summary: Update an area
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated area }
 *       404: { description: Area not found }
 *   delete:
 *     tags: [Areas]
 *     summary: Soft-delete an area (moves to trash)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Area moved to trash }
 *       404: { description: Area not found }
 */
areaRouter.patch("/:id", validate(updateAreaSchema), asyncHandler(updateAreaHandler));
areaRouter.delete("/:id", asyncHandler(deleteAreaHandler));
