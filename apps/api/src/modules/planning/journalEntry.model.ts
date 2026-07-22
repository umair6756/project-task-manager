import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const journalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true },
    mood: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: "" },
  },
  { timestamps: true },
);

journalEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export type JournalEntryDoc = HydratedDocument<InferSchemaType<typeof journalEntrySchema>>;
export const JournalEntry = model("JournalEntry", journalEntrySchema);
