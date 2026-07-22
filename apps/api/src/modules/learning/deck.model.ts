import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const deckSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

deckSchema.index({ userId: 1 });
deckSchema.plugin(softDeletePlugin);

export type DeckDoc = HydratedDocument<InferSchemaType<typeof deckSchema>>;
export const Deck = model("Deck", deckSchema);
