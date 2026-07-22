import type { Request, Response } from "express";
import { WeeklyReview } from "./weeklyReview.model.js";
import { isoWeekToDateRange } from "./isoWeek.js";
import { buildReviewPackage } from "./reviewAggregation.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

export async function getWeeklyReviewHandler(req: Request, res: Response): Promise<void> {
  const isoWeek = req.params.isoWeek as string;
  let range;
  try {
    range = isoWeekToDateRange(isoWeek);
  } catch {
    throw AppError.badRequest("Invalid ISO week format, expected YYYY-Www");
  }

  const [reviewPackage, savedAnswers] = await Promise.all([
    buildReviewPackage(req.userId as string, range.start, range.end),
    WeeklyReview.findOne({ userId: req.userId, isoWeek }),
  ]);
  ok(res, { ...reviewPackage, isoWeek, savedAnswers });
}

export async function saveWeeklyReviewHandler(req: Request, res: Response): Promise<void> {
  const isoWeek = req.params.isoWeek as string;
  const review = await WeeklyReview.findOneAndUpdate(
    { userId: req.userId, isoWeek },
    { $set: req.body },
    { upsert: true, new: true },
  );
  ok(res, { review });
}

export async function getMonthlyReviewHandler(req: Request, res: Response): Promise<void> {
  const { yearMonth } = req.params as { yearMonth: string }; // "YYYY-MM"
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) throw AppError.badRequest("Invalid month format, expected YYYY-MM");
  const start = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  const end = new Date(Date.UTC(Number(match[1]), Number(match[2]), 1));

  const reviewPackage = await buildReviewPackage(req.userId as string, start, end);
  ok(res, { ...reviewPackage, yearMonth });
}

export async function getYearInReviewHandler(req: Request, res: Response): Promise<void> {
  const year = Number(req.params.year);
  if (!Number.isInteger(year)) throw AppError.badRequest("Invalid year");
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const reviewPackage = await buildReviewPackage(req.userId as string, start, end);
  ok(res, { ...reviewPackage, year });
}
