import { z } from "zod";

export const projectStatusSchema = z.enum(["idea", "active", "paused", "done", "archived"]);
export const projectPrioritySchema = z.enum(["P1", "P2", "P3", "P4"]);
export const progressModeSchema = z.enum(["auto", "manual"]);

export const createProjectSchema = z.object({
  areaId: z.string().nullable().optional(),
  name: z.string().min(1).max(150),
  description: z.string().max(5000).optional(),
  status: projectStatusSchema.default("idea"),
  priority: projectPrioritySchema.default("P3"),
  deadline: z.coerce.date().nullable().optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).nullable().optional(),
  progressMode: progressModeSchema.default("auto"),
  manualProgress: z.number().min(0).max(100).optional(),
  pinned: z.boolean().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(150),
  dueDate: z.coerce.date().nullable().optional(),
});
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  done: z.boolean().optional(),
});
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export const instantiateTemplateSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  newStartDate: z.coerce.date(),
});
export type InstantiateTemplateInput = z.infer<typeof instantiateTemplateSchema>;
