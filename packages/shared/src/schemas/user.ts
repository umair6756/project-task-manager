// WHAT: Profile + settings schemas for the users module.
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().min(1).max(64).optional(),
  weekStartDay: z.number().int().min(0).max(6).optional(),
  dayEndHour: z.number().int().min(0).max(6).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Free-form per-user settings blob (theme, accent color, notification
// prefs, etc.) — validated loosely as a record so new keys don't require a
// schema migration; UI-level shape is owned by the frontend.
export const settingsSchema = z.record(z.string(), z.unknown());
export type SettingsInput = z.infer<typeof settingsSchema>;
