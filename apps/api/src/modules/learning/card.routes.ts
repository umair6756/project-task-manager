import { Router } from "express";
import { createCardSchema, updateCardSchema, bulkCreateCardsSchema, reviewCardSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listCardsHandler,
  createCardHandler,
  bulkCreateCardsHandler,
  updateCardHandler,
  deleteCardHandler,
  dueQueueHandler,
  reviewCardHandler,
  reviewHeatmapHandler,
} from "./card.controller.js";

export const cardRouter = Router();
cardRouter.use(requireAuth);

/**
 * @openapi
 * /cards:
 *   get:
 *     tags: [Flashcards]
 *     summary: List cards (filterable by deckId)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of cards }
 *   post:
 *     tags: [Flashcards]
 *     summary: Create a card
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Card created }
 */
cardRouter.get("/", asyncHandler(listCardsHandler));
cardRouter.post("/", validate(createCardSchema), asyncHandler(createCardHandler));

/**
 * @openapi
 * /cards/bulk:
 *   post:
 *     tags: [Flashcards]
 *     summary: Bulk-create cards in a deck
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Cards created }
 */
cardRouter.post("/bulk", validate(bulkCreateCardsSchema), asyncHandler(bulkCreateCardsHandler));

/**
 * @openapi
 * /cards/due:
 *   get:
 *     tags: [Flashcards]
 *     summary: Today's due review queue (timezone/day-end-hour aware)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: deckId
 *         schema: { type: string }
 *     responses:
 *       200: { description: Due cards }
 */
cardRouter.get("/due", asyncHandler(dueQueueHandler));

/**
 * @openapi
 * /cards/heatmap:
 *   get:
 *     tags: [Flashcards]
 *     summary: Review counts per day over the last year
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Heatmap data }
 */
cardRouter.get("/heatmap", asyncHandler(reviewHeatmapHandler));

/**
 * @openapi
 * /cards/{id}:
 *   patch:
 *     tags: [Flashcards]
 *     summary: Update a card
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated card }
 *   delete:
 *     tags: [Flashcards]
 *     summary: Soft-delete a card
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
cardRouter.patch("/:id", validate(updateCardSchema), asyncHandler(updateCardHandler));
cardRouter.delete("/:id", asyncHandler(deleteCardHandler));

/**
 * @openapi
 * /cards/{id}/review:
 *   post:
 *     tags: [Flashcards]
 *     summary: Submit a review grade (Again/Hard/Good/Easy) for a card
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [grade]
 *             properties:
 *               grade: { type: string, enum: [again, hard, good, easy] }
 *     responses:
 *       200: { description: Updated card with new SRS state }
 */
cardRouter.post("/:id/review", validate(reviewCardSchema), asyncHandler(reviewCardHandler));
