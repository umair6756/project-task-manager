// WHAT: Version history — last 20 revisions per note (proposal #83).
// Capped per-note (not a global capped collection) since Mongo capped
// collections can't cap "per document key"; noteRevision.service.ts trims
// older revisions after each insert instead.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const noteRevisionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    title: { type: String, required: true },
    // Not `required: true` — Mongoose's String required validator rejects
    // empty strings too, but an empty note body is a perfectly valid state
    // to snapshot.
    content: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

noteRevisionSchema.index({ noteId: 1, createdAt: -1 });

export type NoteRevisionDoc = HydratedDocument<InferSchemaType<typeof noteRevisionSchema>>;
export const NoteRevision = model("NoteRevision", noteRevisionSchema);
