import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const webhookSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    events: { type: [String], required: true }, // e.g. "task.completed", "habit.checkin"
    secret: { type: String, required: true }, // HMAC signing key
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

webhookSchema.index({ userId: 1 });

export type WebhookDoc = HydratedDocument<InferSchemaType<typeof webhookSchema>>;
export const Webhook = model("Webhook", webhookSchema);

const webhookDeliverySchema = new Schema(
  {
    webhookId: { type: Schema.Types.ObjectId, ref: "Webhook", required: true },
    event: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    attempts: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "delivered", "failed"], default: "pending" },
    lastError: { type: String, default: null },
    nextAttemptAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

webhookDeliverySchema.index({ status: 1, nextAttemptAt: 1 });

export type WebhookDeliveryDoc = HydratedDocument<InferSchemaType<typeof webhookDeliverySchema>>;
export const WebhookDelivery = model("WebhookDelivery", webhookDeliverySchema);
