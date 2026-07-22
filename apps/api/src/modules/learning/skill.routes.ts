import { Router } from "express";
import { createSkillSchema, updateSkillSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listSkillsHandler,
  createSkillHandler,
  updateSkillHandler,
  deleteSkillHandler,
  skillRadarHandler,
} from "./skill.controller.js";

export const skillRouter = Router();
skillRouter.use(requireAuth);

/**
 * @openapi
 * /skills:
 *   get:
 *     tags: [Skills]
 *     summary: List skills
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of skills }
 *   post:
 *     tags: [Skills]
 *     summary: Create a skill
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Skill created }
 */
skillRouter.get("/", asyncHandler(listSkillsHandler));
skillRouter.post("/", validate(createSkillSchema), asyncHandler(createSkillHandler));

/**
 * @openapi
 * /skills/radar:
 *   get:
 *     tags: [Skills]
 *     summary: Skill radar chart data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Radar data }
 */
skillRouter.get("/radar", asyncHandler(skillRadarHandler));

/**
 * @openapi
 * /skills/{id}:
 *   patch:
 *     tags: [Skills]
 *     summary: Update a skill
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated skill }
 *   delete:
 *     tags: [Skills]
 *     summary: Soft-delete a skill
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
skillRouter.patch("/:id", validate(updateSkillSchema), asyncHandler(updateSkillHandler));
skillRouter.delete("/:id", asyncHandler(deleteSkillHandler));
