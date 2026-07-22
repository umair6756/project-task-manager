import { z } from "zod";

export const createAreaSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.number().int().optional(),
});
export type CreateAreaInput = z.infer<typeof createAreaSchema>;

export const updateAreaSchema = createAreaSchema.partial();
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;

export const reorderAreasSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});
export type ReorderAreasInput = z.infer<typeof reorderAreasSchema>;
