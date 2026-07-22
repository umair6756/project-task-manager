import { Router } from "express";
import { createCertificateSchema } from "@flowforge/shared";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { attachmentUpload } from "../tasks/attachmentUpload.js";
import {
  listCertificatesHandler,
  createCertificateHandler,
  deleteCertificateHandler,
} from "./certificate.controller.js";

export const certificateRouter = Router();
certificateRouter.use(requireAuth);

/**
 * @openapi
 * /certificates:
 *   get:
 *     tags: [Certificates]
 *     summary: List certificates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of certificates }
 *   post:
 *     tags: [Certificates]
 *     summary: Upload a certificate
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               issuer: { type: string }
 *               expiresAt: { type: string, format: date-time }
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Certificate created }
 */
certificateRouter.get("/", asyncHandler(listCertificatesHandler));
certificateRouter.post(
  "/",
  attachmentUpload.single("file"),
  validate(createCertificateSchema),
  asyncHandler(createCertificateHandler),
);

/**
 * @openapi
 * /certificates/{id}:
 *   delete:
 *     tags: [Certificates]
 *     summary: Soft-delete a certificate
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
certificateRouter.delete("/:id", asyncHandler(deleteCertificateHandler));
