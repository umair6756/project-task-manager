// WHAT: A measurable key result under a Goal. `binding` optionally wires it
// to an auto-computed source (see keyResultBinding.service.ts); unbound KRs
// are updated manually via check-ins.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const bindingSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["tasksCompletedInProject", "habitCompletionRate", "learningHours"],
      required: true,
    },
    refId: { type: Schema.Types.ObjectId, required: true }, // projectId | habitId | learningItemId
    windowDays: { type: Number, default: 30 }, // lookback window for rate/hours bindings
  },
  { _id: false },
);

const keyResultSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["number", "percent", "boolean"], required: true },
    startValue: { type: Number, default: 0 },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    binding: { type: bindingSchema, default: null },
  },
  { timestamps: true },
);

keyResultSchema.index({ goalId: 1 });

export type KeyResultDoc = HydratedDocument<InferSchemaType<typeof keyResultSchema>>;
export const KeyResult = model("KeyResult", keyResultSchema);
