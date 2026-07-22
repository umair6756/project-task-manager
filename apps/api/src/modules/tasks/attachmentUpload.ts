// WHAT: Multer config for task attachments — unlike avatar upload, any
// common file type is allowed (docs, PDFs, images), not just images.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { env } from "../../config/env.js";

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
});

export const attachmentUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
