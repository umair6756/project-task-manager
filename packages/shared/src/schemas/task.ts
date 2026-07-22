import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in-progress", "blocked", "done", "cancelled"]);
export const taskPrioritySchema = z.enum(["P1", "P2", "P3", "P4"]);

export const recurrenceSchema = z.object({
  freq: z.enum(["daily", "weekly", "monthly"]),
  interval: z.number().int().min(1).default(1),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  mode: z.enum(["spawn", "fixed"]),
  endDate: z.coerce.date().nullable().optional(),
  endAfterOccurrences: z.number().int().min(1).nullable().optional(),
});

export const subtaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  done: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const checklistItemInputSchema = z.object({
  text: z.string().min(1).max(200),
  done: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const createTaskSchema = z.object({
  projectId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("P4"),
  dueAt: z.coerce.date().nullable().optional(),
  startAt: z.coerce.date().nullable().optional(),
  estimateMin: z.number().int().min(0).nullable().optional(),
  labels: z.array(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
  subtasks: z.array(subtaskInputSchema).optional(),
  checklist: z.array(checklistItemInputSchema).optional(),
  recurrence: recurrenceSchema.nullable().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const quickAddSchema = z.object({
  text: z.string().min(1).max(500),
});
export type QuickAddInput = z.infer<typeof quickAddSchema>;

export const batchUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  set: z.object({
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    projectId: z.string().nullable().optional(),
    dueAt: z.coerce.date().nullable().optional(),
    addLabels: z.array(z.string()).optional(),
    removeLabels: z.array(z.string()).optional(),
  }),
});
export type BatchUpdateInput = z.infer<typeof batchUpdateSchema>;

export const completeTaskSchema = z.object({
  overrideDependencyWarning: z.boolean().optional(),
});
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;

export const snoozeReminderSchema = z.object({
  snoozedUntil: z.coerce.date(),
});
export type SnoozeReminderInput = z.infer<typeof snoozeReminderSchema>;

export const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const savedFilterQuerySchema = z.object({
  status: z.array(taskStatusSchema).optional(),
  priority: z.array(taskPrioritySchema).optional(),
  labels: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
});
export type SavedFilterQuery = z.infer<typeof savedFilterQuerySchema>;

export const createSavedFilterSchema = z.object({
  name: z.string().min(1).max(100),
  query: savedFilterQuerySchema,
  pinned: z.boolean().optional(),
});
export type CreateSavedFilterInput = z.infer<typeof createSavedFilterSchema>;

export const updateSavedFilterSchema = createSavedFilterSchema.partial();
export type UpdateSavedFilterInput = z.infer<typeof updateSavedFilterSchema>;
