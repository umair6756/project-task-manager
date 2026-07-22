// WHAT: XP -> level curve (proposal #186). GENEROUSLY COMMENTED (tunable
// via the same "Formula tuning" workflow as productivity score/habit
// strength/SM-2, even though it's not one of the three named there).
//
// FORMULA: xpForLevel(L) = round(100 * L^1.5) is the XP *needed to go from
// level L to level L+1* (level 1->2 costs 100, 2->3 costs ~283, 3->4 costs
// ~520, ...). totalXpForLevel(L) is the cumulative sum of that from 1..L-1
// — i.e. how much total XP it takes to *reach* level L. Levels grow
// super-linearly so late levels take meaningfully longer, without an
// explicit level cap.
const XP_CURVE_EXPONENT = 1.5;
const XP_CURVE_BASE = 100;

export function xpForLevel(level: number): number {
  return Math.round(XP_CURVE_BASE * Math.pow(level, XP_CURVE_EXPONENT));
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function computeLevel(totalXp: number): LevelInfo {
  let level = 1;
  let xpConsumed = 0;
  while (xpConsumed + xpForLevel(level) <= totalXp) {
    xpConsumed += xpForLevel(level);
    level++;
  }
  return {
    level,
    totalXp,
    xpIntoLevel: totalXp - xpConsumed,
    xpForNextLevel: xpForLevel(level),
  };
}
