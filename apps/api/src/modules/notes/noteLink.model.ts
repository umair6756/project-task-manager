// WHAT: One row per [[wiki-link]] found in a note's content, re-derived on
// every save. Powers backlinks (targetNoteId -> who links to it) and the
// graph view (all nodes+edges for a user).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const noteLinkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sourceNoteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    // Resolved only if a note with this exact title exists for the user;
    // unresolved links are still recorded (rawTitle) so the graph/backlink
    // UI can show a "create this note" affordance later.
    targetNoteId: { type: Schema.Types.ObjectId, ref: "Note", default: null },
    rawTitle: { type: String, required: true },
  },
  { timestamps: true },
);

noteLinkSchema.index({ sourceNoteId: 1 });
noteLinkSchema.index({ targetNoteId: 1 });

export type NoteLinkDoc = HydratedDocument<InferSchemaType<typeof noteLinkSchema>>;
export const NoteLink = model("NoteLink", noteLinkSchema);
