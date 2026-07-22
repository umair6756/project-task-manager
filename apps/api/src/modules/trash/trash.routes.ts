import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listTrashHandler, restoreTrashHandler, purgeTrashHandler } from "./trash.controller.js";

export const trashRouter = Router();
trashRouter.use(requireAuth);

/**
 * @openapi
 * /trash:
 *   get:
 *     tags: [Trash]
 *     summary: List all soft-deleted items across models (30-day retention)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of trashed items }
 */
trashRouter.get("/", asyncHandler(listTrashHandler));

/**
 * @openapi
 * /trash/{model}/{id}/restore:
 *   post:
 *     tags: [Trash]
 *     summary: Restore a trashed item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Restored }
 *       404: { description: Not found }
 * /trash/{model}/{id}:
 *   delete:
 *     tags: [Trash]
 *     summary: Permanently delete a trashed item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Purged }
 *       404: { description: Not found }
 */
trashRouter.post("/:model/:id/restore", asyncHandler(restoreTrashHandler));
trashRouter.delete("/:model/:id", asyncHandler(purgeTrashHandler));
