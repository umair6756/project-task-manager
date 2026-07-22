import { Router } from "express";
import {
  createTaskSchema,
  updateTaskSchema,
  quickAddSchema,
  batchUpdateSchema,
  completeTaskSchema,
  createCommentSchema,
  snoozeReminderSchema,
} from "@flowforge/shared";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { attachmentUpload } from "./attachmentUpload.js";
import {
  listTasksHandler,
  createTaskHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  completeTaskHandler,
  duplicateTaskHandler,
  batchUpdateHandler,
  reorderTasksHandler,
  quickAddHandler,
  addCommentHandler,
  addAttachmentHandler,
  snoozeReminderHandler,
} from "./task.controller.js";

const reorderSchema = z.object({ orderedIds: z.array(z.string()).min(1) });

export const taskRouter = Router();
taskRouter.use(requireAuth);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks (filterable by status/priority/projectId/label)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of tasks }
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Task created }
 */
taskRouter.get("/", asyncHandler(listTasksHandler));
taskRouter.post("/", validate(createTaskSchema), asyncHandler(createTaskHandler));

/**
 * @openapi
 * /tasks/quick-add:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task from natural-language quick-add text
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string, example: "pay bill tomorrow 5pm p1 #home" }
 *     responses:
 *       201: { description: Task created from parsed text }
 */
taskRouter.post("/quick-add", validate(quickAddSchema), asyncHandler(quickAddHandler));

/**
 * @openapi
 * /tasks/batch:
 *   post:
 *     tags: [Tasks]
 *     summary: Apply a bulk update to multiple tasks (status/label/project/reschedule)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Batch update result }
 */
taskRouter.post("/batch", validate(batchUpdateSchema), asyncHandler(batchUpdateHandler));

/**
 * @openapi
 * /tasks/reorder:
 *   post:
 *     tags: [Tasks]
 *     summary: Persist a new manual sort order for tasks
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Reordered }
 */
taskRouter.post("/reorder", validate(reorderSchema), asyncHandler(reorderTasksHandler));

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task }
 *       404: { description: Task not found }
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated task }
 *   delete:
 *     tags: [Tasks]
 *     summary: Soft-delete a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task moved to trash }
 */
taskRouter.get("/:id", asyncHandler(getTaskHandler));
taskRouter.patch("/:id", validate(updateTaskSchema), asyncHandler(updateTaskHandler));
taskRouter.delete("/:id", asyncHandler(deleteTaskHandler));

/**
 * @openapi
 * /tasks/{id}/complete:
 *   post:
 *     tags: [Tasks]
 *     summary: Mark a task done (may return a dependency warning instead)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overrideDependencyWarning: { type: boolean }
 *     responses:
 *       200: { description: Completed, or a dependency warning payload }
 * /tasks/{id}/duplicate:
 *   post:
 *     tags: [Tasks]
 *     summary: Duplicate a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Duplicated task }
 */
taskRouter.post("/:id/complete", validate(completeTaskSchema), asyncHandler(completeTaskHandler));
taskRouter.post("/:id/duplicate", asyncHandler(duplicateTaskHandler));

/**
 * @openapi
 * /tasks/{id}/comments:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a comment to a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Comment added }
 * /tasks/{id}/attachments:
 *   post:
 *     tags: [Tasks]
 *     summary: Attach a file to a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Attachment added }
 */
taskRouter.post("/:id/comments", validate(createCommentSchema), asyncHandler(addCommentHandler));
taskRouter.post("/:id/attachments", attachmentUpload.single("file"), asyncHandler(addAttachmentHandler));

/**
 * @openapi
 * /tasks/{id}/reminders/{reminderId}/snooze:
 *   post:
 *     tags: [Tasks]
 *     summary: Snooze a reminder to a later time
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: reminderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Reminder snoozed }
 *       404: { description: Reminder not found }
 */
taskRouter.post(
  "/:id/reminders/:reminderId/snooze",
  validate(snoozeReminderSchema),
  asyncHandler(snoozeReminderHandler),
);
