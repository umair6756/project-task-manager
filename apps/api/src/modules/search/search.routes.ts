import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { globalSearchHandler } from "./search.controller.js";

export const searchRouter = Router();
searchRouter.use(requireAuth);

/**
 * @openapi
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Global search across tasks/notes/projects/learning items
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Merged, ranked results }
 */
searchRouter.get("/", asyncHandler(globalSearchHandler));
