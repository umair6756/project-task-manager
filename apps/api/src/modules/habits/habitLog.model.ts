// WHAT: One row per habit per logical day. dateKey ("YYYY-MM-DD", from
// dateService.getLogicalDay) + unique index makes check-in idempotent —
// checking in twice on the same day just updates the existing row.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const habitLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true },
    dateKey: { type: String, required: true },
    status: { type: String, enum: ["done", "skipped"], required: true },
    skipReason: { type: String, default: null },
    value: { type: Number, default: null }, // quantified habits
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

habitLogSchema.index({ habitId: 1, dateKey: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, dateKey: 1 });

export type HabitLogDoc = HydratedDocument<InferSchemaType<typeof habitLogSchema>>;
export const HabitLog = model("HabitLog", habitLogSchema);
