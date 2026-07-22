import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listNotebooksHandler,
  createNotebookHandler,
  updateNotebookHandler,
  deleteNotebookHandler,
} from "./notebook.controller.js";

const createNotebookSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});
const updateNotebookSchema = createNotebookSchema.partial();

export const notebookRouter = Router();
notebookRouter.use(requireAuth);

/**
 * @openapi
 * /notebooks:
 *   get:
 *     tags: [Notebooks]
 *     summary: List notebooks (hierarchy via parentId)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of notebooks }
 *   post:
 *     tags: [Notebooks]
 *     summary: Create a notebook
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Notebook created }
 */
notebookRouter.get("/", asyncHandler(listNotebooksHandler));
notebookRouter.post("/", validate(createNotebookSchema), asyncHandler(createNotebookHandler));

/**
 * @openapi
 * /notebooks/{id}:
 *   patch:
 *     tags: [Notebooks]
 *     summary: Update a notebook
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated notebook }
 *   delete:
 *     tags: [Notebooks]
 *     summary: Soft-delete a notebook
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
notebookRouter.patch("/:id", validate(updateNotebookSchema), asyncHandler(updateNotebookHandler));
notebookRouter.delete("/:id", asyncHandler(deleteNotebookHandler));
