// WHAT: OKR-style goals (CLAUDE.md §1 module G). Roll-up progress + traffic-
// light status are computed (not stored) by goalProgress.service.ts from
// this goal's keyResults, so they never go stale.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    horizon: { type: String, enum: ["year", "quarter", "month"], required: true },
    title: { type: String, required: true, trim: true },
    theme: { type: String, default: "" }, // e.g. "Year of Health"
    status: { type: String, enum: ["active", "archived"], default: "active" },
    outcomeNote: { type: String, default: "" }, // filled in on archive
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, horizon: 1, status: 1 });
goalSchema.plugin(softDeletePlugin);

export type GoalDoc = HydratedDocument<InferSchemaType<typeof goalSchema>>;
export const Goal = model("Goal", goalSchema);
