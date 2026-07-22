import { z } from "zod";

export const saveWeeklyReviewSchema = z.object({
  wentWell: z.string().max(5000).optional(),
  didntGoWell: z.string().max(5000).optional(),
  lessons: z.string().max(5000).optional(),
});
export type SaveWeeklyReviewInput = z.infer<typeof saveWeeklyReviewSchema>;
