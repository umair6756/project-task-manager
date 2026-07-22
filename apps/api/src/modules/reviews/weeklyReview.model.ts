// WHAT: Stores the user's saved answers to a given week's review — the
// GET /reviews/week/:isoWeek aggregation itself is never persisted (always
// computed fresh), only what the user wrote back.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const weeklyReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isoWeek: { type: String, required: true }, // "YYYY-Www"
    wentWell: { type: String, default: "" },
    didntGoWell: { type: String, default: "" },
    lessons: { type: String, default: "" },
  },
  { timestamps: true },
);

weeklyReviewSchema.index({ userId: 1, isoWeek: 1 }, { unique: true });

export type WeeklyReviewDoc = HydratedDocument<InferSchemaType<typeof weeklyReviewSchema>>;
export const WeeklyReview = model("WeeklyReview", weeklyReviewSchema);
