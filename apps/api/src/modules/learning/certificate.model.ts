import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const certificateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    learningItemId: { type: Schema.Types.ObjectId, ref: "LearningItem", default: null },
    title: { type: String, required: true, trim: true },
    issuer: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    issuedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    expiryReminderSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

certificateSchema.index({ userId: 1, expiresAt: 1 });
certificateSchema.plugin(softDeletePlugin);

export type CertificateDoc = HydratedDocument<InferSchemaType<typeof certificateSchema>>;
export const Certificate = model("Certificate", certificateSchema);
