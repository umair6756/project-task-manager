import { Router } from "express";
import { startTimerSchema, createManualEntrySchema, updateManualEntrySchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getRunningTimerHandler,
  startTimerHandler,
  stopTimerHandler,
  listEntriesHandler,
  createManualEntryHandler,
  updateManualEntryHandler,
  deleteEntryHandler,
} from "./timeEntry.controller.js";

export const timeEntryRouter = Router();
timeEntryRouter.use(requireAuth);

/**
 * @openapi
 * /time-entries:
 *   get:
 *     tags: [Time]
 *     summary: List time entries (optionally by from/to range)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of time entries }
 *   post:
 *     tags: [Time]
 *     summary: Create a manual time entry (rejects overlaps)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Entry created }
 *       409: { description: Overlaps an existing entry }
 */
timeEntryRouter.get("/", asyncHandler(listEntriesHandler));
timeEntryRouter.post("/", validate(createManualEntrySchema), asyncHandler(createManualEntryHandler));

/**
 * @openapi
 * /time-entries/running:
 *   get:
 *     tags: [Time]
 *     summary: Get the currently running timer, if any
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Running timer or null }
 * /time-entries/start:
 *   post:
 *     tags: [Time]
 *     summary: Start a timer (409 if one is already running)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Timer started }
 *       409: { description: A timer is already running }
 * /time-entries/stop:
 *   post:
 *     tags: [Time]
 *     summary: Stop the running timer
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Timer stopped }
 */
timeEntryRouter.get("/running", asyncHandler(getRunningTimerHandler));
timeEntryRouter.post("/start", validate(startTimerSchema), asyncHandler(startTimerHandler));
timeEntryRouter.post("/stop", asyncHandler(stopTimerHandler));

/**
 * @openapi
 * /time-entries/{id}:
 *   patch:
 *     tags: [Time]
 *     summary: Update a manual time entry (rejects overlaps)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated entry }
 *   delete:
 *     tags: [Time]
 *     summary: Delete a time entry
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
timeEntryRouter.patch("/:id", validate(updateManualEntrySchema), asyncHandler(updateManualEntryHandler));
timeEntryRouter.delete("/:id", asyncHandler(deleteEntryHandler));
