// WHAT: One doc per mutating request ("everything you did, per day" —
// proposal feature #13). TTL index purges after 180 days per CLAUDE.md §3.
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const activityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    entityType: { type: String }, // best-effort, derived from path e.g. "tasks"
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

export type ActivityLogDoc = HydratedDocument<InferSchemaType<typeof activityLogSchema>>;
export const ActivityLog = model("ActivityLog", activityLogSchema);
