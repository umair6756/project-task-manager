import { z } from "zod";

export const learningItemTypeSchema = z.enum(["course", "book", "video", "article", "tutorial"]);
export const learningItemStatusSchema = z.enum(["wishlist", "learning", "completed", "abandoned"]);
export const progressUnitSchema = z.enum(["percent", "pages", "lectures", "hours"]);

export const createLearningItemSchema = z.object({
  type: learningItemTypeSchema,
  title: z.string().min(1).max(200),
  source: z.string().max(200).optional(),
  url: z.string().max(500).optional(),
  status: learningItemStatusSchema.default("wishlist"),
  progressUnit: progressUnitSchema.default("percent"),
  progressTarget: z.number().min(0).optional(),
  sections: z.array(z.object({ title: z.string().min(1).max(200) })).optional(),
  skillIds: z.array(z.string()).optional(),
  takeaways: z.string().max(10000).optional(),
});
export type CreateLearningItemInput = z.infer<typeof createLearningItemSchema>;

export const updateLearningItemSchema = createLearningItemSchema.partial();
export type UpdateLearningItemInput = z.infer<typeof updateLearningItemSchema>;

export const progressUpdateSchema = z.object({
  value: z.number().min(0),
  note: z.string().max(500).optional(),
});
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.number().int().min(1).max(5).default(1),
  category: z.string().max(100).optional(),
});
export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export const updateSkillSchema = createSkillSchema.partial();
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

export const createCertificateSchema = z.object({
  learningItemId: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  issuer: z.string().max(200).optional(),
  issuedAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});
export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;

export const createDeckSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
});
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export const updateDeckSchema = createDeckSchema.partial();

export const createCardSchema = z.object({
  deckId: z.string(),
  front: z.string().min(1).max(5000),
  back: z.string().min(1).max(5000),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;
export const updateCardSchema = z.object({
  front: z.string().min(1).max(5000).optional(),
  back: z.string().min(1).max(5000).optional(),
});

export const bulkCreateCardsSchema = z.object({
  deckId: z.string(),
  cards: z.array(z.object({ front: z.string().min(1).max(5000), back: z.string().min(1).max(5000) })).min(1),
});
export type BulkCreateCardsInput = z.infer<typeof bulkCreateCardsSchema>;

export const reviewCardSchema = z.object({
  grade: z.enum(["again", "hard", "good", "easy"]),
});
export type ReviewCardInput = z.infer<typeof reviewCardSchema>;
