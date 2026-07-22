// WHAT: Spaced-repetition scheduler — a simplified SM-2 (SuperMemo-2) with
// Anki-style 4-button grading (Again/Hard/Good/Easy) instead of SM-2's
// original 0-5 quality scale. Pure function, no I/O — the deck/card
// controllers own persistence, this owns only the math.
//
// GENEROUSLY COMMENTED ON PURPOSE (per CLAUDE.md — this is one of the four
// "logic hotspots" I'll come back to tune):
//
// States: new -> learning -> review (-> learning again on a lapse).
//   - "new"/"learning" are collapsed together here: the brief's "learning
//     steps 1m/10m simplified to same-day" means we do NOT track sub-day
//     step timers. Any Again/Hard on a new-or-learning card just re-queues
//     it for "now" (still due today); Good/Easy is what promotes a card out
//     of learning into the real day-scale SM-2 interval math below.
//   - "review" is where the actual SM-2 ease-factor/interval formulas run.
//
// Grading a "review"-state card:
//   Again (lapse): ease -= 0.20 (floor 1.3), interval resets to 0 (due now,
//                  same-day re-learning), reps resets to 0, lapses += 1.
//   Hard:          ease -= 0.15 (floor 1.3), interval *= 1.2 (slower growth
//                  than Good — the card comes back sooner than it "should").
//   Good:          ease unchanged, interval *= ease (the textbook SM-2 step).
//   Easy:          ease += 0.15, interval *= ease * 1.3 (an "easy bonus" so
//                  cards you find trivial stop bothering you as often).
// All intervals are rounded to whole days and floored at 1 day once a card
// is in "review" state (0 is reserved for "due today" / relearning).
import type { CardDoc } from "./card.model.js";

export type Grade = "again" | "hard" | "good" | "easy";

const MIN_EASE = 1.3;
const LAPSE_EASE_PENALTY = 0.2;
const HARD_EASE_PENALTY = 0.15;
const EASY_EASE_BONUS = 0.15;
const HARD_INTERVAL_MULTIPLIER = 1.2;
const EASY_INTERVAL_BONUS_MULTIPLIER = 1.3;
const FIRST_GOOD_INTERVAL_DAYS = 1;
const FIRST_EASY_INTERVAL_DAYS = 4;

export interface Srs {
  ease: number;
  intervalDays: number;
  dueAt: Date;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review";
}

export function gradeSrs(srs: Srs, grade: Grade, now: Date = new Date()): Srs {
  // Card is still in its (collapsed) learning phase.
  if (srs.state === "new" || srs.state === "learning") {
    if (grade === "again" || grade === "hard") {
      return { ...srs, state: "learning", intervalDays: 0, dueAt: now, reps: 0 };
    }
    const intervalDays = grade === "easy" ? FIRST_EASY_INTERVAL_DAYS : FIRST_GOOD_INTERVAL_DAYS;
    return {
      ...srs,
      state: "review",
      intervalDays,
      dueAt: addDays(now, intervalDays),
      reps: 1,
    };
  }

  // Card is in steady-state SM-2 review.
  if (grade === "again") {
    return {
      ease: Math.max(MIN_EASE, srs.ease - LAPSE_EASE_PENALTY),
      intervalDays: 0,
      dueAt: now,
      reps: 0,
      lapses: srs.lapses + 1,
      state: "learning",
    };
  }

  if (grade === "hard") {
    const ease = Math.max(MIN_EASE, srs.ease - HARD_EASE_PENALTY);
    const intervalDays = Math.max(1, Math.round(srs.intervalDays * HARD_INTERVAL_MULTIPLIER));
    return { ...srs, ease, intervalDays, dueAt: addDays(now, intervalDays), reps: srs.reps + 1 };
  }

  if (grade === "good") {
    const intervalDays = Math.max(1, Math.round(srs.intervalDays * srs.ease));
    return { ...srs, intervalDays, dueAt: addDays(now, intervalDays), reps: srs.reps + 1 };
  }

  // easy
  const ease = srs.ease + EASY_EASE_BONUS;
  const intervalDays = Math.max(1, Math.round(srs.intervalDays * ease * EASY_INTERVAL_BONUS_MULTIPLIER));
  return { ...srs, ease, intervalDays, dueAt: addDays(now, intervalDays), reps: srs.reps + 1 };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function applyGradeToCard(card: CardDoc, grade: Grade, now: Date = new Date()): void {
  const next = gradeSrs(card.srs as unknown as Srs, grade, now);
  card.srs.ease = next.ease;
  card.srs.intervalDays = next.intervalDays;
  card.srs.dueAt = next.dueAt;
  card.srs.reps = next.reps;
  card.srs.lapses = next.lapses;
  card.srs.state = next.state;
}
