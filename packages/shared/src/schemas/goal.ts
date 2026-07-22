import { z } from "zod";

export const createGoalSchema = z.object({
  horizon: z.enum(["year", "quarter", "month"]),
  title: z.string().min(1).max(200),
  theme: z.string().max(200).optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export const updateGoalSchema = createGoalSchema.partial();

export const archiveGoalSchema = z.object({
  outcomeNote: z.string().max(2000).optional(),
});
export type ArchiveGoalInput = z.infer<typeof archiveGoalSchema>;

export const keyResultBindingSchema = z.object({
  kind: z.enum(["tasksCompletedInProject", "habitCompletionRate", "learningHours"]),
  refId: z.string(),
  windowDays: z.number().int().min(1).max(365).optional(),
});

export const createKeyResultSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["number", "percent", "boolean"]),
  startValue: z.number().optional(),
  targetValue: z.number(),
  binding: keyResultBindingSchema.nullable().optional(),
});
export type CreateKeyResultInput = z.infer<typeof createKeyResultSchema>;
export const updateKeyResultSchema = createKeyResultSchema.partial();

export const createGoalCheckInSchema = z.object({
  keyResultId: z.string().nullable().optional(),
  value: z.number().nullable().optional(),
  reflection: z.string().max(2000).optional(),
});
export type CreateGoalCheckInInput = z.infer<typeof createGoalCheckInSchema>;
