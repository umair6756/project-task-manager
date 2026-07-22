import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const milestoneSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, default: null },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

milestoneSchema.index({ projectId: 1 });

export type MilestoneDoc = HydratedDocument<InferSchemaType<typeof milestoneSchema>>;
export const Milestone = model("Milestone", milestoneSchema);
