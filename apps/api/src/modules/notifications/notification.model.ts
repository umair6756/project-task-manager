import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g. "task.reminder"
    title: { type: String, required: true },
    body: { type: String, default: "" },
    entityType: { type: String, default: null }, // e.g. "Task"
    entityId: { type: Schema.Types.ObjectId, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>>;
export const Notification = model("Notification", notificationSchema);
