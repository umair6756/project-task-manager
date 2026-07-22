// WHAT: The Task document — the largest schema in the app (CLAUDE.md §3).
// Subtasks/checklist/reminders are embedded (always read together with the
// task); labels/dependsOn are references (queried independently, e.g. "all
// tasks with label X" or dependency graphs).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const subtaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false },
);

const checklistItemSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false },
);

const reminderSchema = new Schema(
  {
    remindAt: { type: Date, required: true },
    sentAt: { type: Date, default: null },
    snoozedUntil: { type: Date, default: null },
  },
  { _id: true, timestamps: false },
);

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false },
);

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false },
);

const activityEntrySchema = new Schema(
  {
    action: { type: String, required: true }, // e.g. "created", "completed", "rescheduled"
    detail: { type: Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false, timestamps: false },
);

// RRULE subset (not the full RFC-5545 grammar): a fixed interval unit +
// optional weekday set, with an end condition. `mode` decides whether the
// next occurrence is spawned when the current one is completed ("spawn") or
// materialized ahead of time on a fixed calendar schedule regardless of
// completion ("fixed") — see recurrence.service.ts for the full behavior.
const recurrenceSchema = new Schema(
  {
    freq: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    interval: { type: Number, default: 1, min: 1 }, // every N freq units
    weekdays: { type: [Number], default: undefined }, // 0=Sun..6=Sat, weekly only
    mode: { type: String, enum: ["spawn", "fixed"], required: true },
    endDate: { type: Date, default: null },
    endAfterOccurrences: { type: Number, default: null },
    occurrenceCount: { type: Number, default: 0 }, // how many have been produced so far
  },
  { _id: false },
);

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "blocked", "done", "cancelled"],
      default: "todo",
    },
    priority: { type: String, enum: ["P1", "P2", "P3", "P4"], default: "P4" },
    dueAt: { type: Date, default: null },
    startAt: { type: Date, default: null },
    estimateMin: { type: Number, default: null },
    sortOrder: { type: Number, default: 0 },
    labels: [{ type: Schema.Types.ObjectId, ref: "Label" }],
    dependsOn: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    subtasks: { type: [subtaskSchema], default: [] },
    checklist: { type: [checklistItemSchema], default: [] },
    reminders: { type: [reminderSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },
    activity: { type: [activityEntrySchema], default: [] },
    recurrence: { type: recurrenceSchema, default: null },
    // For a spawned/materialized occurrence, points back at the recurring
    // "template" task it came from (used by the recurrence service, not set
    // on the template itself).
    recurrenceParentId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    completedAt: { type: Date, default: null },
    postponeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, status: 1, dueAt: 1 });
taskSchema.index({ userId: 1, projectId: 1, sortOrder: 1 });
taskSchema.plugin(softDeletePlugin);

export type TaskDoc = HydratedDocument<InferSchemaType<typeof taskSchema>>;
export const Task = model("Task", taskSchema);
