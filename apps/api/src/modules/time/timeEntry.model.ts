// WHAT: A tracked block of time (CLAUDE.md §1 module H). `end: null` means
// "still running" — timeEntry.service.ts enforces at most one such row per
// user at a time.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const timeEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    learningItemId: { type: Schema.Types.ObjectId, ref: "LearningItem", default: null },
    start: { type: Date, required: true },
    end: { type: Date, default: null },
    source: { type: String, enum: ["timer", "manual", "pomodoro"], required: true },
    note: { type: String, default: "" },
    billable: { type: Boolean, default: false },
    hourlyRate: { type: Number, default: null },
  },
  { timestamps: true },
);

timeEntrySchema.index({ userId: 1, start: -1 });
timeEntrySchema.index({ userId: 1, end: 1 });

export type TimeEntryDoc = HydratedDocument<InferSchemaType<typeof timeEntrySchema>>;
export const TimeEntry = model("TimeEntry", timeEntrySchema);
