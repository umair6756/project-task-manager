import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional(),
});
export type CreateLabelInput = z.infer<typeof createLabelSchema>;

export const updateLabelSchema = createLabelSchema.partial();
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
