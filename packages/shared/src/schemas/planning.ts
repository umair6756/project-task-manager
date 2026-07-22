import { z } from "zod";

export const updatePlanNotesSchema = z.object({
  planNotes: z.string().max(5000),
});
export type UpdatePlanNotesInput = z.infer<typeof updatePlanNotesSchema>;

export const setMitsSchema = z.object({
  taskIds: z.array(z.string()).max(3),
});
export type SetMitsInput = z.infer<typeof setMitsSchema>;

export const shutdownSchema = z.object({
  shutdownNotes: z.string().max(5000).optional(),
  tomorrowNotes: z.string().max(5000).optional(),
});
export type ShutdownInput = z.infer<typeof shutdownSchema>;

export const upsertJournalEntrySchema = z.object({
  mood: z.number().int().min(1).max(5),
  text: z.string().max(10000).optional(),
});
export type UpsertJournalEntryInput = z.infer<typeof upsertJournalEntrySchema>;
