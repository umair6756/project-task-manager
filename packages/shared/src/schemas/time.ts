import { z } from "zod";

export const startTimerSchema = z.object({
  taskId: z.string().nullable().optional(),
  learningItemId: z.string().nullable().optional(),
  note: z.string().max(500).optional(),
});
export type StartTimerInput = z.infer<typeof startTimerSchema>;

export const createManualEntrySchema = z.object({
  taskId: z.string().nullable().optional(),
  learningItemId: z.string().nullable().optional(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  note: z.string().max(500).optional(),
  billable: z.boolean().optional(),
  hourlyRate: z.number().min(0).nullable().optional(),
});
export type CreateManualEntryInput = z.infer<typeof createManualEntrySchema>;

export const updateManualEntrySchema = createManualEntrySchema.partial();
export type UpdateManualEntryInput = z.infer<typeof updateManualEntrySchema>;

export const createPomodoroSessionSchema = z.object({
  taskId: z.string().nullable().optional(),
  workLenMin: z.number().int().min(1).default(25),
  breakLenMin: z.number().int().min(1).default(5),
  cycles: z.number().int().min(1).default(4),
});
export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionSchema>;

export const reportsRangeQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
export type ReportsRangeQuery = z.infer<typeof reportsRangeQuerySchema>;
