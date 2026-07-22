// WHAT: The 50 seeded achievement definitions (proposal #187). Each is a
// simple threshold rule against one "stat" (a countable/maxable number
// computed on demand by achievementStats.service.ts) — no separate rules
// engine needed for something this shaped. XP rewards feed xp.service.ts.
export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  category: string;
  statKey: string;
  threshold: number;
  xpReward: number;
}

function tier(category: string, statKey: string, thresholds: number[], label: (n: number) => string, xp: (n: number) => number): AchievementDef[] {
  return thresholds.map((n) => ({
    key: `${statKey}_${n}`,
    name: label(n),
    description: `Reach ${n} for ${statKey}`,
    category,
    statKey,
    threshold: n,
    xpReward: xp(n),
  }));
}

export const ACHIEVEMENTS: AchievementDef[] = [
  ...tier("tasks", "tasksCompleted", [1, 10, 50, 100, 250, 500], (n) => `Task Master ${n}`, (n) => n),
  ...tier("habits", "habitStreak", [3, 7, 14, 30, 100, 365], (n) => `${n}-Day Streak`, (n) => n * 2),
  ...tier("learning", "cardsReviewed", [10, 50, 100, 500, 1000], (n) => `Flashcard Grinder ${n}`, (n) => Math.round(n / 2)),
  ...tier("notes", "notesCreated", [1, 5, 10, 50], (n) => `Note Taker ${n}`, (n) => n * 3),
  ...tier("learning", "learningItemsCompleted", [1, 3, 10, 25], (n) => `Lifelong Learner ${n}`, (n) => n * 20),
  ...tier("focus", "pomodorosCompleted", [1, 5, 25, 100], (n) => `Focus Streak ${n}`, (n) => n * 5),
  ...tier("goals", "goalsCompleted", [1, 3, 10], (n) => `Goal Getter ${n}`, (n) => n * 30),
  ...tier("focus", "focusMinutesTotal", [60, 300, 1000, 5000], (n) => `Deep Work ${n}m`, (n) => Math.round(n / 10)),
  ...tier("journal", "journalEntries", [1, 7, 30, 100], (n) => `Journal Keeper ${n}`, (n) => n * 2),
  ...tier("habits", "habitCheckins", [1, 10, 50, 200], (n) => `Consistency ${n}`, (n) => n),
  ...tier("projects", "projectsCompleted", [1, 3, 10], (n) => `Project Finisher ${n}`, (n) => n * 40),
  ...tier("learning", "skillsAtLevel5", [1, 3], (n) => `Mastery x${n}`, (n) => n * 50),
  ...tier("learning", "certificatesEarned", [1], () => `First Certificate`, () => 25),
];

if (ACHIEVEMENTS.length !== 50) {
  throw new Error(`Expected exactly 50 seeded achievements, got ${ACHIEVEMENTS.length}`);
}
