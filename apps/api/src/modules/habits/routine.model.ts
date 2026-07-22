// WHAT: An ordered group of habits run together (morning/evening routine,
// proposal #127). "Run mode" sessions are ephemeral client-side steppers —
// the server only needs to record that a run happened, via RoutineRun.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const routineSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    timeOfDay: { type: String, default: null }, // "HH:mm"
    habitIds: [{ type: Schema.Types.ObjectId, ref: "Habit", required: true }],
  },
  { timestamps: true },
);

routineSchema.index({ userId: 1 });
routineSchema.plugin(softDeletePlugin);

export type RoutineDoc = HydratedDocument<InferSchemaType<typeof routineSchema>>;
export const Routine = model("Routine", routineSchema);

const routineRunSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: false },
);
routineRunSchema.index({ routineId: 1, startedAt: -1 });

export type RoutineRunDoc = HydratedDocument<InferSchemaType<typeof routineRunSchema>>;
export const RoutineRun = model("RoutineRun", routineRunSchema);
