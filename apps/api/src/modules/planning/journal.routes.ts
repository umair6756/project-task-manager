import { Router } from "express";
import { upsertJournalEntrySchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listJournalEntriesHandler, upsertTodayEntryHandler, moodCorrelationHandler } from "./journal.controller.js";

export const journalRouter = Router();
journalRouter.use(requireAuth);

/**
 * @openapi
 * /journal:
 *   get:
 *     tags: [Journal]
 *     summary: List journal entries
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of journal entries }
 *   post:
 *     tags: [Journal]
 *     summary: Upsert today's journal entry (mood + text)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Journal entry }
 */
journalRouter.get("/", asyncHandler(listJournalEntriesHandler));
journalRouter.post("/", validate(upsertJournalEntrySchema), asyncHandler(upsertTodayEntryHandler));

/**
 * @openapi
 * /journal/mood-correlation:
 *   get:
 *     tags: [Journal]
 *     summary: Pearson correlation between mood and tasks completed per day
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Correlation data }
 */
journalRouter.get("/mood-correlation", asyncHandler(moodCorrelationHandler));
