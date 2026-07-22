// WHAT: The Note document — markdown content, tags, links to tasks/
// projects, daily-note flag, template flag. Text-indexed for search.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const noteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notebookId: { type: Schema.Types.ObjectId, ref: "Notebook", default: null },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
    favorited: { type: Boolean, default: false },
    linkedTaskIds: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    linkedProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    // "YYYY-MM-DD" in the user's logical-day terms, set only for daily notes.
    dailyDate: { type: String, default: null },
    isTemplate: { type: Boolean, default: false },
  },
  { timestamps: true },
);

noteSchema.index({ userId: 1, notebookId: 1 });
// NOTE: `sparse: true` alone is not enough here — the schema explicitly
// defaults dailyDate to null, so every regular note *has* the field (with
// value null) and a sparse index still indexes explicit nulls, colliding
// across all non-daily notes. A partial filter that requires an actual
// string value is what actually limits the unique constraint to daily notes.
noteSchema.index(
  { userId: 1, dailyDate: 1 },
  { unique: true, partialFilterExpression: { dailyDate: { $type: "string" } } },
);
noteSchema.index({ title: "text", content: "text" });
noteSchema.plugin(softDeletePlugin);

export type NoteDoc = HydratedDocument<InferSchemaType<typeof noteSchema>>;
export const Note = model("Note", noteSchema);
