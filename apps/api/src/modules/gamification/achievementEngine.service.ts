// WHAT: Event-driven-ish achievement checker. In practice "event-driven"
// here means "called after the action that could move a stat" (task
// complete, habit check-in, card review, ...) rather than a full pub/sub
// bus — simpler, and equivalent at this scale since every call site is
// already known.
import { ACHIEVEMENTS } from "./achievement.catalog.js";
import { computeStat } from "./achievementStats.service.js";
import { UserAchievement, UserGamification, StreakFreezeToken } from "./userGamification.model.js";

export interface NewlyEarned {
  key: string;
  name: string;
  xpReward: number;
}

async function awardXp(userId: string, amount: number): Promise<void> {
  await UserGamification.findOneAndUpdate(
    { userId },
    { $inc: { totalXp: amount } },
    { upsert: true },
  );
}

// Call after any action that could move `statKey` (e.g. "tasksCompleted"
// after a task is marked done). Awards every not-yet-earned achievement in
// that stat category whose threshold the current value now meets.
export async function checkAchievementsForStat(userId: string, statKey: string): Promise<NewlyEarned[]> {
  const candidates = ACHIEVEMENTS.filter((a) => a.statKey === statKey);
  if (candidates.length === 0) return [];

  const currentValue = await computeStat(userId, statKey);
  const alreadyEarned = new Set(
    (await UserAchievement.find({ userId, achievementKey: { $in: candidates.map((c) => c.key) } }))
      .map((a) => a.achievementKey),
  );

  const newlyEarned: NewlyEarned[] = [];
  for (const def of candidates) {
    if (alreadyEarned.has(def.key)) continue;
    if (currentValue < def.threshold) continue;
    await UserAchievement.create({ userId, achievementKey: def.key });
    await awardXp(userId, def.xpReward);
    newlyEarned.push({ key: def.key, name: def.name, xpReward: def.xpReward });
  }
  return newlyEarned;
}

// Earn rule: crossing a new multiple of 7 in a habit's current streak
// awards one streak-freeze token (a "you've earned a vacation day" nudge).
export async function maybeAwardStreakFreezeToken(
  userId: string,
  previousStreak: number,
  newStreak: number,
): Promise<boolean> {
  const previousMilestone = Math.floor(previousStreak / 7);
  const newMilestone = Math.floor(newStreak / 7);
  if (newMilestone > previousMilestone && newStreak > 0) {
    await StreakFreezeToken.create({ userId });
    return true;
  }
  return false;
}
