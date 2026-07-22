import { Router } from "express";
import { updateProfileSchema, settingsSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload } from "./upload.js";
import {
  updateProfileHandler,
  uploadAvatarHandler,
  getSettingsHandler,
  updateSettingsHandler,
} from "./user.controller.js";

export const userRouter = Router();
userRouter.use(requireAuth);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update the current user's profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               timezone: { type: string }
 *               weekStartDay: { type: integer, minimum: 0, maximum: 6 }
 *               dayEndHour: { type: integer, minimum: 0, maximum: 6 }
 *     responses:
 *       200: { description: Updated profile }
 */
userRouter.patch("/me", validate(updateProfileSchema), asyncHandler(updateProfileHandler));

/**
 * @openapi
 * /users/me/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload a profile avatar
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar uploaded }
 */
userRouter.post("/me/avatar", upload.single("avatar"), asyncHandler(uploadAvatarHandler));

/**
 * @openapi
 * /users/me/settings:
 *   get:
 *     tags: [Users]
 *     summary: Get the current user's settings blob
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Settings }
 *   put:
 *     tags: [Users]
 *     summary: Replace the current user's settings blob
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: Updated settings }
 */
userRouter.get("/me/settings", asyncHandler(getSettingsHandler));
userRouter.put("/me/settings", validate(settingsSchema), asyncHandler(updateSettingsHandler));
