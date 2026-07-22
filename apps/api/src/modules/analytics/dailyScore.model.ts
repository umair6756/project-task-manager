import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const dailyScoreSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true },
    score: { type: Number, required: true },
    tasksScore: { type: Number, required: true },
    focusScore: { type: Number, required: true },
    habitScore: { type: Number, required: true },
    mitScore: { type: Number, required: true },
  },
  { timestamps: true },
);

dailyScoreSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export type DailyScoreDoc = HydratedDocument<InferSchemaType<typeof dailyScoreSchema>>;
export const DailyScore = model("DailyScore", dailyScoreSchema);
