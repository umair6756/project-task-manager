import { Router } from "express";
import { createSavedFilterSchema, updateSavedFilterSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listSavedFiltersHandler,
  createSavedFilterHandler,
  updateSavedFilterHandler,
  deleteSavedFilterHandler,
  executeSavedFilterHandler,
} from "./savedFilter.controller.js";

export const savedFilterRouter = Router();
savedFilterRouter.use(requireAuth);

/**
 * @openapi
 * /saved-filters:
 *   get:
 *     tags: [SavedFilters]
 *     summary: List saved filters
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of saved filters }
 *   post:
 *     tags: [SavedFilters]
 *     summary: Create a saved filter
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Saved filter created }
 */
savedFilterRouter.get("/", asyncHandler(listSavedFiltersHandler));
savedFilterRouter.post("/", validate(createSavedFilterSchema), asyncHandler(createSavedFilterHandler));

/**
 * @openapi
 * /saved-filters/{id}:
 *   patch:
 *     tags: [SavedFilters]
 *     summary: Update a saved filter
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated saved filter }
 *   delete:
 *     tags: [SavedFilters]
 *     summary: Delete a saved filter
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 * /saved-filters/{id}/execute:
 *   get:
 *     tags: [SavedFilters]
 *     summary: Run a saved filter and return matching tasks
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Matching tasks }
 */
savedFilterRouter.patch("/:id", validate(updateSavedFilterSchema), asyncHandler(updateSavedFilterHandler));
savedFilterRouter.delete("/:id", asyncHandler(deleteSavedFilterHandler));
savedFilterRouter.get("/:id/execute", asyncHandler(executeSavedFilterHandler));
