// WHAT: Notebooks form a hierarchy (parentId self-reference) that Notes
// live inside (proposal #72).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const notebookSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Notebook", default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

notebookSchema.index({ userId: 1, parentId: 1 });
notebookSchema.plugin(softDeletePlugin);

export type NotebookDoc = HydratedDocument<InferSchemaType<typeof notebookSchema>>;
export const Notebook = model("Notebook", notebookSchema);
