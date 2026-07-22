// WHAT: Learning streak — counts consecutive logical days (timezone/day-
// end-hour aware) on which the user did *something* learning-related: a
// progress update on a learning item, or a flashcard review.
import { LearningItem } from "./learningItem.model.js";
import { CardReview } from "./cardReview.model.js";
import { getLogicalDay } from "../../utils/dateService.js";

export interface LearningStreak {
  current: number;
  best: number;
}

async function hasActivityOnDay(userId: string, dayStart: Date, dayEnd: Date): Promise<boolean> {
  const [progressCount, reviewCount] = await Promise.all([
    LearningItem.countDocuments({
      userId,
      "progressHistory.createdAt": { $gte: dayStart, $lt: dayEnd },
    }),
    CardReview.countDocuments({ userId, reviewedAt: { $gte: dayStart, $lt: dayEnd } }),
  ]);
  return progressCount > 0 || reviewCount > 0;
}

// Walks backward day by day from "today" while activity is found — same
// approach as habit streaks will use in Phase 6, kept here in miniature
// since learning streaks don't need schedule-awareness (every day counts).
export async function computeLearningStreak(
  userId: string,
  timezone: string,
  dayEndHour: number,
  now: Date = new Date(),
): Promise<LearningStreak> {
  let current = 0;
  let cursor = now;
  // Cap the walk so a user with zero history doesn't trigger unbounded
  // queries; 3 years is comfortably beyond any realistic streak.
  const maxDays = 365 * 3;

  for (let i = 0; i < maxDays; i++) {
    const day = getLogicalDay(timezone, dayEndHour, cursor);
    const active = await hasActivityOnDay(userId, day.startUtc, day.endUtc);
    // Step to the previous logical day regardless of today's outcome — it's
    // used below whether we continue (today inactive) or loop again.
    const previousDayCursor = new Date(day.startUtc.getTime() - 60 * 60 * 1000);

    if (!active) {
      if (i === 0) {
        // Today hasn't happened yet — that shouldn't break yesterday's
        // streak, so just start walking backward from yesterday instead.
        cursor = previousDayCursor;
        continue;
      }
      break;
    }

    current++;
    cursor = previousDayCursor;
  }

  return { current, best: current }; // `best` upgraded to a real historical max in Phase 8's analytics pass
}
