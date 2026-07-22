// WHAT: A habit's definition + schedule (CLAUDE.md §1 module F). currentStreak
// /bestStreak are cached (recomputed by habitStreak.service.ts on every
// check-in/skip) so list views don't need to recompute on every read.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const scheduleSchema = new Schema(
  {
    kind: { type: String, enum: ["daily", "perWeek", "weekdays"], required: true },
    timesPerWeek: { type: Number, default: null }, // perWeek only
    weekdays: { type: [Number], default: undefined }, // weekdays only, 0=Sun..6=Sat
  },
  { _id: false },
);

const habitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: null },
    color: { type: String, default: "#22c55e" },
    type: { type: String, enum: ["positive", "negative"], default: "positive" },
    schedule: { type: scheduleSchema, required: true },
    quantTarget: { type: Number, default: null }, // e.g. 8 glasses of water
    reminderTimes: { type: [String], default: [] }, // "HH:mm" 24h strings
    archived: { type: Boolean, default: false },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
  },
  { timestamps: true },
);

habitSchema.index({ userId: 1, archived: 1 });
habitSchema.plugin(softDeletePlugin);

export type HabitDoc = HydratedDocument<InferSchemaType<typeof habitSchema>>;
export const Habit = model("Habit", habitSchema);
