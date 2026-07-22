// WHAT: The User document. Every other collection in the app carries a
// userId referencing this (multi-user-ready design per CLAUDE.md section 1).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    // Timezone + day-end hour drive every "what day is it" calculation
    // (streaks, today views, heatmaps) — see src/utils/dateService.ts.
    timezone: { type: String, default: "UTC" },
    weekStartDay: { type: Number, min: 0, max: 6, default: 1 }, // 0=Sun..6=Sat, default Monday
    dayEndHour: { type: Number, min: 0, max: 6, default: 0 }, // hour [0-6am) still counted as "yesterday"
    settings: { type: Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;
export const User = model("User", userSchema);
