// WHAT: Projects live inside an Area (optional) and are the parent of tasks
// (Phase 3), milestones, and templates (CLAUDE.md §1 module B).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const projectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    areaId: { type: Schema.Types.ObjectId, ref: "Area", default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["idea", "active", "paused", "done", "archived"],
      default: "idea",
    },
    priority: { type: String, enum: ["P1", "P2", "P3", "P4"], default: "P3" },
    deadline: { type: Date, default: null },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: null },
    progressMode: { type: String, enum: ["auto", "manual"], default: "auto" },
    manualProgress: { type: Number, min: 0, max: 100, default: 0 },
    pinned: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    // Set when this project was saved as a reusable template (proposal #25);
    // template docs are excluded from normal project listings.
    isTemplate: { type: Boolean, default: false },
    // Reference point used to date-shift a template on instantiate (delta =
    // newStartDate - templateAnchorDate, applied to deadline + milestones).
    templateAnchorDate: { type: Date, default: null },
    // Preserved so "archive" can be undone without guessing the prior status.
    statusBeforeArchive: { type: String, default: null },
  },
  { timestamps: true },
);

projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, areaId: 1, sortOrder: 1 });
projectSchema.plugin(softDeletePlugin);

export type ProjectDoc = HydratedDocument<InferSchemaType<typeof projectSchema>>;
export const Project = model("Project", projectSchema);
