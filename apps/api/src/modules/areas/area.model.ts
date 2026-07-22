// WHAT: Areas are top-level "life buckets" (Work, Health, Learning...) that
// projects belong to (CLAUDE.md §1 module B / proposal feature #19).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const areaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: null },
    color: { type: String, default: "#6366f1" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

areaSchema.index({ userId: 1, sortOrder: 1 });
areaSchema.plugin(softDeletePlugin);

export type AreaDoc = HydratedDocument<InferSchemaType<typeof areaSchema>>;
export const Area = model("Area", areaSchema);
