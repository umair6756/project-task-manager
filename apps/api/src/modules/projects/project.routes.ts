import { Router } from "express";
import {
  createProjectSchema,
  updateProjectSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  instantiateTemplateSchema,
} from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listProjectsHandler,
  listTemplatesHandler,
  createProjectHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  archiveProjectHandler,
  restoreProjectHandler,
  pinProjectHandler,
  saveTemplateHandler,
  instantiateTemplateHandler,
  listMilestonesHandler,
  createMilestoneHandler,
  updateMilestoneHandler,
  deleteMilestoneHandler,
} from "./project.controller.js";

export const projectRouter = Router();
projectRouter.use(requireAuth);

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: List projects (optionally filtered by status/areaId)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: areaId
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of projects with computed progress + health }
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Project created }
 */
projectRouter.get("/", asyncHandler(listProjectsHandler));
projectRouter.post("/", validate(createProjectSchema), asyncHandler(createProjectHandler));

/**
 * @openapi
 * /projects/templates:
 *   get:
 *     tags: [Projects]
 *     summary: List saved project templates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of templates }
 */
projectRouter.get("/templates", asyncHandler(listTemplatesHandler));

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project }
 *       404: { description: Project not found }
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated project }
 *   delete:
 *     tags: [Projects]
 *     summary: Soft-delete a project (moves to trash)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project moved to trash }
 */
projectRouter.get("/:id", asyncHandler(getProjectHandler));
projectRouter.patch("/:id", validate(updateProjectSchema), asyncHandler(updateProjectHandler));
projectRouter.delete("/:id", asyncHandler(deleteProjectHandler));

/**
 * @openapi
 * /projects/{id}/archive:
 *   post:
 *     tags: [Projects]
 *     summary: Archive a project (remembers prior status for restore)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Archived project }
 * /projects/{id}/restore:
 *   post:
 *     tags: [Projects]
 *     summary: Restore an archived project to its prior status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Restored project }
 * /projects/{id}/pin:
 *   post:
 *     tags: [Projects]
 *     summary: Toggle pinned state
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Project with toggled pin }
 */
projectRouter.post("/:id/archive", asyncHandler(archiveProjectHandler));
projectRouter.post("/:id/restore", asyncHandler(restoreProjectHandler));
projectRouter.post("/:id/pin", asyncHandler(pinProjectHandler));

/**
 * @openapi
 * /projects/{id}/save-template:
 *   post:
 *     tags: [Projects]
 *     summary: Save this project as a reusable template
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Template created }
 * /projects/{id}/instantiate:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project from a template, date-shifting milestones/tasks
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
 *             required: [newStartDate]
 *             properties:
 *               name: { type: string }
 *               newStartDate: { type: string, format: date-time }
 *     responses:
 *       201: { description: Project created from template }
 */
projectRouter.post("/:id/save-template", asyncHandler(saveTemplateHandler));
projectRouter.post(
  "/:id/instantiate",
  validate(instantiateTemplateSchema),
  asyncHandler(instantiateTemplateHandler),
);

/**
 * @openapi
 * /projects/{projectId}/milestones:
 *   get:
 *     tags: [Milestones]
 *     summary: List a project's milestones
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of milestones }
 *   post:
 *     tags: [Milestones]
 *     summary: Create a milestone
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Milestone created }
 */
projectRouter.get("/:projectId/milestones", asyncHandler(listMilestonesHandler));
projectRouter.post(
  "/:projectId/milestones",
  validate(createMilestoneSchema),
  asyncHandler(createMilestoneHandler),
);

/**
 * @openapi
 * /projects/{projectId}/milestones/{milestoneId}:
 *   patch:
 *     tags: [Milestones]
 *     summary: Update a milestone
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated milestone }
 *   delete:
 *     tags: [Milestones]
 *     summary: Delete a milestone
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Milestone deleted }
 */
projectRouter.patch(
  "/:projectId/milestones/:milestoneId",
  validate(updateMilestoneSchema),
  asyncHandler(updateMilestoneHandler),
);
projectRouter.delete("/:projectId/milestones/:milestoneId", asyncHandler(deleteMilestoneHandler));
