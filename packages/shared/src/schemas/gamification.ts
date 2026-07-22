import { z } from "zod";

export const spendStreakFreezeSchema = z.object({
  habitId: z.string(),
  dateKey: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export type SpendStreakFreezeInput = z.infer<typeof spendStreakFreezeSchema>;
