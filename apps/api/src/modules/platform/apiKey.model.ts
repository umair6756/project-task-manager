// WHAT: Personal API keys for scripting/automation (proposal #17). Stored
// as a SHA-256 hash, never the raw key — same pattern as refresh tokens.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const apiKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true },
    scopes: { type: [String], default: ["read", "write"] },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

apiKeySchema.index({ keyHash: 1 }, { unique: true });

export type ApiKeyDoc = HydratedDocument<InferSchemaType<typeof apiKeySchema>>;
export const ApiKey = model("ApiKey", apiKeySchema);
