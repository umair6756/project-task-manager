// WHAT: One document per logical day — MITs (up to 3), the morning plan
// note, and the evening shutdown ritual payload (proposal #167-171). Get-
// or-create by dateKey, same pattern as the daily Note.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const dailyPlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true },
    mitTaskIds: { type: [Schema.Types.ObjectId], ref: "Task", default: [] },
    planNotes: { type: String, default: "" },
    shutdownNotes: { type: String, default: "" },
    tomorrowNotes: { type: String, default: "" },
    shutdownDone: { type: Boolean, default: false },
  },
  { timestamps: true },
);

dailyPlanSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export type DailyPlanDoc = HydratedDocument<InferSchemaType<typeof dailyPlanSchema>>;
export const DailyPlan = model("DailyPlan", dailyPlanSchema);
