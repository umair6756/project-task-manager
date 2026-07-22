// WHAT: Daily job body — snapshots each user's productivity score for
// "yesterday" (the logical day that just closed) into DailyScore.
import { User } from "../modules/users/user.model.js";
import { DailyScore } from "../modules/analytics/dailyScore.model.js";
import { computeDailyProductivityScore } from "../modules/analytics/productivityScore.service.js";
import { getLogicalDay } from "../utils/dateService.js";

export async function runDailySnapshot(): Promise<number> {
  const users = await User.find({ deletedAt: null }).select("_id timezone dayEndHour");
  let count = 0;

  for (const user of users) {
    // "Yesterday" relative to the user's own logical day, so the snapshot
    // always covers a day that has fully closed for them.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { dateKey, startUtc, endUtc } = getLogicalDay(user.timezone, user.dayEndHour, yesterday);
    const breakdown = await computeDailyProductivityScore(String(user._id), startUtc, endUtc);

    await DailyScore.findOneAndUpdate(
      { userId: user._id, dateKey },
      { $set: breakdown },
      { upsert: true },
    );
    count++;
  }

  return count;
}
