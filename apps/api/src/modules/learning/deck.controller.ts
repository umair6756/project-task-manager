import type { Request, Response } from "express";
import { Deck } from "./deck.model.js";
import { Card } from "./card.model.js";
import { CardReview } from "./cardReview.model.js";
import { getLogicalDay } from "../../utils/dateService.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function listDecksHandler(req: Request, res: Response): Promise<void> {
  const decks = await Deck.find({ userId: req.userId }).sort({ name: 1 });
  const withDueCounts = await Promise.all(
    decks.map(async (deck) => {
      const dueCount = await Card.countDocuments({ deckId: deck._id, "srs.dueAt": { $lte: new Date() } });
      return { ...deck.toObject(), dueCount };
    }),
  );
  ok(res, { decks: withDueCounts });
}

export async function createDeckHandler(req: Request, res: Response): Promise<void> {
  const deck = await Deck.create({ ...req.body, userId: req.userId });
  ok(res, { deck }, 201);
}

export async function updateDeckHandler(req: Request, res: Response): Promise<void> {
  const deck = await Deck.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!deck) throw AppError.notFound("Deck not found");
  ok(res, { deck });
}

export async function deleteDeckHandler(req: Request, res: Response): Promise<void> {
  const deck = await Deck.findOne({ _id: req.params.id, userId: req.userId });
  if (!deck) throw AppError.notFound("Deck not found");
  deck.deletedAt = new Date();
  await deck.save();
  ok(res, { deleted: true });
}

// Retention % (good/easy share of reviews in the last 30 days), 7-day due
// forecast (cards becoming due each of the next 7 logical days).
export async function deckStatsHandler(req: Request, res: Response): Promise<void> {
  const deck = await Deck.findOne({ _id: req.params.id, userId: req.userId });
  if (!deck) throw AppError.notFound("Deck not found");

  const user = await User.findOne({ _id: req.userId, deletedAt: null }).select("timezone dayEndHour");
  if (!user) throw AppError.notFound("User not found");

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reviews = await CardReview.find({ deckId: deck._id, reviewedAt: { $gte: since } }).select("grade").lean();
  const retention =
    reviews.length === 0
      ? null
      : Math.round((reviews.filter((r) => r.grade === "good" || r.grade === "easy").length / reviews.length) * 100);

  const forecast: { dateKey: string; count: number }[] = [];
  let cursorNow = new Date();
  for (let i = 0; i < 7; i++) {
    const day = getLogicalDay(user.timezone, user.dayEndHour, cursorNow);
    const count = await Card.countDocuments({
      deckId: deck._id,
      "srs.dueAt": { $gte: day.startUtc, $lt: day.endUtc },
    });
    forecast.push({ dateKey: day.dateKey, count });
    cursorNow = new Date(day.endUtc.getTime() + 60 * 60 * 1000);
  }

  ok(res, { retention, forecast });
}
