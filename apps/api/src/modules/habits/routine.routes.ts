import { Router } from "express";
import { createRoutineSchema, updateRoutineSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listRoutinesHandler,
  createRoutineHandler,
  updateRoutineHandler,
  deleteRoutineHandler,
  startRunHandler,
  completeRunHandler,
} from "./routine.controller.js";

export const routineRouter = Router();
routineRouter.use(requireAuth);

/**
 * @openapi
 * /routines:
 *   get:
 *     tags: [Routines]
 *     summary: List routines
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of routines }
 *   post:
 *     tags: [Routines]
 *     summary: Create a routine
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Routine created }
 */
routineRouter.get("/", asyncHandler(listRoutinesHandler));
routineRouter.post("/", validate(createRoutineSchema), asyncHandler(createRoutineHandler));

/**
 * @openapi
 * /routines/{id}:
 *   patch:
 *     tags: [Routines]
 *     summary: Update a routine
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated routine }
 *   delete:
 *     tags: [Routines]
 *     summary: Soft-delete a routine
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
routineRouter.patch("/:id", validate(updateRoutineSchema), asyncHandler(updateRoutineHandler));
routineRouter.delete("/:id", asyncHandler(deleteRoutineHandler));

/**
 * @openapi
 * /routines/{id}/runs:
 *   post:
 *     tags: [Routines]
 *     summary: Start a routine run-mode session
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Run started }
 * /routines/{id}/runs/{runId}/complete:
 *   post:
 *     tags: [Routines]
 *     summary: Mark a routine run complete
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: runId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Run marked complete }
 */
routineRouter.post("/:id/runs", asyncHandler(startRunHandler));
routineRouter.post("/:id/runs/:runId/complete", asyncHandler(completeRunHandler));
