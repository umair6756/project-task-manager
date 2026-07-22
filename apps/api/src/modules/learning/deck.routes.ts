import { Router } from "express";
import { createDeckSchema, updateDeckSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listDecksHandler,
  createDeckHandler,
  updateDeckHandler,
  deleteDeckHandler,
  deckStatsHandler,
} from "./deck.controller.js";

export const deckRouter = Router();
deckRouter.use(requireAuth);

/**
 * @openapi
 * /decks:
 *   get:
 *     tags: [Flashcards]
 *     summary: List decks with due counts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of decks }
 *   post:
 *     tags: [Flashcards]
 *     summary: Create a deck
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Deck created }
 */
deckRouter.get("/", asyncHandler(listDecksHandler));
deckRouter.post("/", validate(createDeckSchema), asyncHandler(createDeckHandler));

/**
 * @openapi
 * /decks/{id}:
 *   patch:
 *     tags: [Flashcards]
 *     summary: Update a deck
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated deck }
 *   delete:
 *     tags: [Flashcards]
 *     summary: Soft-delete a deck
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 * /decks/{id}/stats:
 *   get:
 *     tags: [Flashcards]
 *     summary: Retention % (last 30 days) + 7-day due forecast
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deck stats }
 */
deckRouter.patch("/:id", validate(updateDeckSchema), asyncHandler(updateDeckHandler));
deckRouter.delete("/:id", asyncHandler(deleteDeckHandler));
deckRouter.get("/:id/stats", asyncHandler(deckStatsHandler));
