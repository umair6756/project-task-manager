// WHAT: A flashcard with its embedded SM-2 spaced-repetition state. The srs
// sub-object is exactly what sm2.service.ts reads/writes — see that file
// for the algorithm itself.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const srsSchema = new Schema(
  {
    ease: { type: Number, default: 2.5 }, // SM-2 "easiness factor", min clamped at 1.3
    intervalDays: { type: Number, default: 0 }, // 0 = due immediately (new/relearning)
    dueAt: { type: Date, default: () => new Date() },
    reps: { type: Number, default: 0 }, // consecutive successful (non-Again) reviews
    lapses: { type: Number, default: 0 }, // total times graded "Again" after leaving "new"
    state: { type: String, enum: ["new", "learning", "review"], default: "new" },
  },
  { _id: false },
);

const cardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    srs: { type: srsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

cardSchema.index({ userId: 1, deckId: 1 });
cardSchema.index({ userId: 1, "srs.dueAt": 1 });
cardSchema.plugin(softDeletePlugin);

export type CardDoc = HydratedDocument<InferSchemaType<typeof cardSchema>>;
export const Card = model("Card", cardSchema);
