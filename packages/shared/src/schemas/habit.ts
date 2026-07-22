import { z } from "zod";

export const habitScheduleSchema = z.object({
  kind: z.enum(["daily", "perWeek", "weekdays"]),
  timesPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
});

export const createHabitSchema = z.object({
  name: z.string().min(1).max(150),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().max(20).optional(),
  type: z.enum(["positive", "negative"]).default("positive"),
  schedule: habitScheduleSchema,
  quantTarget: z.number().min(0).nullable().optional(),
  reminderTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).optional(),
});
export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export const updateHabitSchema = createHabitSchema.partial();
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

export const checkinHabitSchema = z.object({
  value: z.number().optional(),
  note: z.string().max(500).optional(),
});
export type CheckinHabitInput = z.infer<typeof checkinHabitSchema>;

export const skipHabitSchema = z.object({
  reason: z.string().max(300).optional(),
});
export type SkipHabitInput = z.infer<typeof skipHabitSchema>;

export const createRoutineSchema = z.object({
  name: z.string().min(1).max(150),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  habitIds: z.array(z.string()).min(1),
});
export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
export const updateRoutineSchema = createRoutineSchema.partial();
