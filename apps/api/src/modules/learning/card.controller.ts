import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Card } from "./card.model.js";
import { checkAchievementsForStat } from "../gamification/achievementEngine.service.js";
import { Deck } from "./deck.model.js";
import { CardReview } from "./cardReview.model.js";
import { applyGradeToCard, type Grade } from "./sm2.service.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

async function findOwnedOr404(id: string, userId: string) {
  const card = await Card.findOne({ _id: id, userId });
  if (!card) throw AppError.notFound("Card not found");
  return card;
}

export async function listCardsHandler(req: Request, res: Response): Promise<void> {
  const { deckId } = req.query as { deckId?: string };
  const filter: Record<string, unknown> = { userId: req.userId };
  if (deckId) filter.deckId = deckId;
  const cards = await Card.find(filter).sort({ createdAt: -1 });
  ok(res, { cards });
}

export async function createCardHandler(req: Request, res: Response): Promise<void> {
  const card = await Card.create({ ...req.body, userId: req.userId });
  ok(res, { card }, 201);
}

export async function bulkCreateCardsHandler(req: Request, res: Response): Promise<void> {
  const { deckId, cards } = req.body as { deckId: string; cards: { front: string; back: string }[] };
  const created = await Card.insertMany(
    cards.map((c) => ({ userId: req.userId, deckId, front: c.front, back: c.back })),
  );
  ok(res, { cards: created }, 201);
}

export async function updateCardHandler(req: Request, res: Response): Promise<void> {
  const card = await findOwnedOr404(req.params.id as string, req.userId as string);
  card.set(req.body);
  await card.save();
  ok(res, { card });
}

export async function deleteCardHandler(req: Request, res: Response): Promise<void> {
  const card = await findOwnedOr404(req.params.id as string, req.userId as string);
  card.deletedAt = new Date();
  await card.save();
  ok(res, { deleted: true });
}

// The daily due queue: every card (across decks, or filtered to one) whose
// srs.dueAt has arrived by the end of the user's *current logical day* —
// not raw "now", so a card due at 11pm still shows up if the user's day
// hasn't ended yet under their day-end-hour setting.
export async function dueQueueHandler(req: Request, res: Response): Promise<void> {
  const { deckId } = req.query as { deckId?: string };
  const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");
  const { endUtc } = getLogicalDay(user.timezone, user.dayEndHour);

  const filter: Record<string, unknown> = { userId: req.userId, "srs.dueAt": { $lte: endUtc } };
  if (deckId) filter.deckId = deckId;

  const cards = await Card.find(filter).sort({ "srs.dueAt": 1 });
  ok(res, { cards, count: cards.length });
}

export async function reviewCardHandler(req: Request, res: Response): Promise<void> {
  const card = await findOwnedOr404(req.params.id as string, req.userId as string);
  const { grade } = req.body as { grade: Grade };

  applyGradeToCard(card, grade);
  await card.save();

  await CardReview.create({
    userId: req.userId,
    cardId: card._id,
    deckId: card.deckId,
    grade,
    intervalDaysAfter: card.srs.intervalDays,
  });

  const newlyEarned = await checkAchievementsForStat(req.userId as string, "cardsReviewed");
  ok(res, { card, newlyEarned });
}

// Review heatmap: review counts per day over the last year (GitHub-style).
export async function reviewHeatmapHandler(req: Request, res: Response): Promise<void> {
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const results = await CardReview.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId), reviewedAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$reviewedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  ok(res, { heatmap: results.map((r) => ({ date: r._id, count: r.count })) });
}
