// WHAT: One row per review submission — powers retention %, due forecast,
// and the review heatmap. Kept separate from Card so history isn't lost
// when a card's current srs state moves on.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const cardReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
    deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    grade: { type: String, enum: ["again", "hard", "good", "easy"], required: true },
    intervalDaysAfter: { type: Number, required: true },
    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

cardReviewSchema.index({ userId: 1, reviewedAt: -1 });
cardReviewSchema.index({ deckId: 1, reviewedAt: -1 });

export type CardReviewDoc = HydratedDocument<InferSchemaType<typeof cardReviewSchema>>;
export const CardReview = model("CardReview", cardReviewSchema);
