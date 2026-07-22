import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const checkInSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    keyResultId: { type: Schema.Types.ObjectId, ref: "KeyResult", default: null },
    value: { type: Number, default: null },
    reflection: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

checkInSchema.index({ goalId: 1, createdAt: -1 });

export type CheckInDoc = HydratedDocument<InferSchemaType<typeof checkInSchema>>;
export const CheckIn = model("CheckIn", checkInSchema);
