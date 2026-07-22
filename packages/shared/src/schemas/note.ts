import { z } from "zod";

export const createNoteSchema = z.object({
  notebookId: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  content: z.string().max(200000).optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  favorited: z.boolean().optional(),
  linkedTaskIds: z.array(z.string()).optional(),
  linkedProjectIds: z.array(z.string()).optional(),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = createNoteSchema.partial();
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const searchNotesQuerySchema = z.object({
  q: z.string().min(1),
});
export type SearchNotesQuery = z.infer<typeof searchNotesQuerySchema>;

export const createFromTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  notebookId: z.string().nullable().optional(),
});
export type CreateFromTemplateInput = z.infer<typeof createFromTemplateSchema>;
