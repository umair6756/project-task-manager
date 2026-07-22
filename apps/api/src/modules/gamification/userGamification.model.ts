import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const userGamificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalXp: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type UserGamificationDoc = HydratedDocument<InferSchemaType<typeof userGamificationSchema>>;
export const UserGamification = model("UserGamification", userGamificationSchema);

const userAchievementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievementKey: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);
userAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

export type UserAchievementDoc = HydratedDocument<InferSchemaType<typeof userAchievementSchema>>;
export const UserAchievement = model("UserAchievement", userAchievementSchema);

const streakFreezeTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    earnedAt: { type: Date, default: Date.now },
    spentAt: { type: Date, default: null },
    spentOnHabitId: { type: Schema.Types.ObjectId, ref: "Habit", default: null },
    spentOnDateKey: { type: String, default: null },
  },
  { timestamps: false },
);
streakFreezeTokenSchema.index({ userId: 1, spentAt: 1 });

export type StreakFreezeTokenDoc = HydratedDocument<InferSchemaType<typeof streakFreezeTokenSchema>>;
export const StreakFreezeToken = model("StreakFreezeToken", streakFreezeTokenSchema);
