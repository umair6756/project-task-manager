import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const skillSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    level: { type: Number, min: 1, max: 5, default: 1 },
    category: { type: String, default: "" },
  },
  { timestamps: true },
);

skillSchema.index({ userId: 1, name: 1 }, { unique: true });
skillSchema.plugin(softDeletePlugin);

export type SkillDoc = HydratedDocument<InferSchemaType<typeof skillSchema>>;
export const Skill = model("Skill", skillSchema);
