import { Router } from "express";
import { createNoteSchema, updateNoteSchema, createFromTemplateSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload } from "../users/upload.js";
import { AppError } from "../../utils/AppError.js";
import { ok } from "../../utils/respond.js";
import {
  listNotesHandler,
  createNoteHandler,
  getNoteHandler,
  updateNoteHandler,
  deleteNoteHandler,
  searchNotesHandler,
  getDailyNoteHandler,
  getBacklinksHandler,
  getGraphHandler,
  listTemplatesHandler,
  saveAsTemplateHandler,
  createFromTemplateHandler,
  listRevisionsHandler,
  restoreRevisionHandler,
  exportNoteHandler,
} from "./note.controller.js";

export const noteRouter = Router();
noteRouter.use(requireAuth);

/**
 * @openapi
 * /notes:
 *   get:
 *     tags: [Notes]
 *     summary: List notes (filterable by notebookId/tag/favorited/pinned)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of notes }
 *   post:
 *     tags: [Notes]
 *     summary: Create a note
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Note created }
 */
noteRouter.get("/", asyncHandler(listNotesHandler));
noteRouter.post("/", validate(createNoteSchema), asyncHandler(createNoteHandler));

/**
 * @openapi
 * /notes/search:
 *   get:
 *     tags: [Notes]
 *     summary: Full-text search across notes with a snippet
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Matching notes with snippets }
 */
noteRouter.get("/search", asyncHandler(searchNotesHandler));

/**
 * @openapi
 * /notes/daily:
 *   get:
 *     tags: [Notes]
 *     summary: Get-or-create today's daily note (timezone/day-end-hour aware)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Today's daily note }
 */
noteRouter.get("/daily", asyncHandler(getDailyNoteHandler));

/**
 * @openapi
 * /notes/graph:
 *   get:
 *     tags: [Notes]
 *     summary: Wiki-link graph (nodes + edges) for the whole user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Graph data }
 */
noteRouter.get("/graph", asyncHandler(getGraphHandler));

/**
 * @openapi
 * /notes/templates:
 *   get:
 *     tags: [Notes]
 *     summary: List note templates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of templates }
 */
noteRouter.get("/templates", asyncHandler(listTemplatesHandler));

/**
 * @openapi
 * /notes/image-upload:
 *   post:
 *     tags: [Notes]
 *     summary: Upload an image for embedding in note content
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Uploaded image URL }
 */
noteRouter.post(
  "/image-upload",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw AppError.badRequest("No file uploaded");
    ok(res, { url: `/uploads/${req.file.filename}` }, 201);
  }),
);

/**
 * @openapi
 * /notes/{id}:
 *   get:
 *     tags: [Notes]
 *     summary: Get a note (checkbox state refreshed from linked task status)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Note }
 *       404: { description: Note not found }
 *   patch:
 *     tags: [Notes]
 *     summary: Update a note (re-syncs wiki-links and checkbox tasks)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated note }
 *   delete:
 *     tags: [Notes]
 *     summary: Soft-delete a note
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
noteRouter.get("/:id", asyncHandler(getNoteHandler));
noteRouter.patch("/:id", validate(updateNoteSchema), asyncHandler(updateNoteHandler));
noteRouter.delete("/:id", asyncHandler(deleteNoteHandler));

/**
 * @openapi
 * /notes/{id}/backlinks:
 *   get:
 *     tags: [Notes]
 *     summary: List notes that link to this note
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Backlinks }
 * /notes/{id}/export:
 *   get:
 *     tags: [Notes]
 *     summary: Download the note as a .md file
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Markdown file }
 * /notes/{id}/save-template:
 *   post:
 *     tags: [Notes]
 *     summary: Save this note as a reusable template
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Template created }
 */
noteRouter.get("/:id/backlinks", asyncHandler(getBacklinksHandler));
noteRouter.get("/:id/export", asyncHandler(exportNoteHandler));
noteRouter.post("/:id/save-template", asyncHandler(saveAsTemplateHandler));

/**
 * @openapi
 * /notes/{id}/create-from-template:
 *   post:
 *     tags: [Notes]
 *     summary: Create a new note from a template
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Note created from template }
 */
noteRouter.post(
  "/:id/create-from-template",
  validate(createFromTemplateSchema),
  asyncHandler(createFromTemplateHandler),
);

/**
 * @openapi
 * /notes/{id}/revisions:
 *   get:
 *     tags: [Notes]
 *     summary: List a note's revision history (last 20)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Revisions }
 * /notes/{id}/revisions/{revisionId}/restore:
 *   post:
 *     tags: [Notes]
 *     summary: Restore a note to a prior revision
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: revisionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Restored note }
 */
noteRouter.get("/:id/revisions", asyncHandler(listRevisionsHandler));
noteRouter.post("/:id/revisions/:revisionId/restore", asyncHandler(restoreRevisionHandler));
