// WHAT: One document per issued refresh token. WHY: enables rotation
// (each refresh issues a new doc + revokes the old one) and revocation
// (logout, or reuse-of-a-revoked-token detection => revoke whole family).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Hash of the token string, never the raw token — mirrors password storage.
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true }, // groups a rotation chain
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ tokenHash: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDoc = HydratedDocument<InferSchemaType<typeof refreshTokenSchema>>;
export const RefreshToken = model("RefreshToken", refreshTokenSchema);
