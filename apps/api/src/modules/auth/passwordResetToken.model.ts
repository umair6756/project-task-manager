// WHAT: Short-lived single-use tokens for the forgot/reset password flow.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

passwordResetTokenSchema.index({ tokenHash: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetTokenDoc = HydratedDocument<
  InferSchemaType<typeof passwordResetTokenSchema>
>;
export const PasswordResetToken = model("PasswordResetToken", passwordResetTokenSchema);
