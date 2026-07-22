import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const labelSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#94a3b8" },
  },
  { timestamps: true },
);

labelSchema.index({ userId: 1, name: 1 }, { unique: true });
labelSchema.plugin(softDeletePlugin);

export type LabelDoc = HydratedDocument<InferSchemaType<typeof labelSchema>>;
export const Label = model("Label", labelSchema);
