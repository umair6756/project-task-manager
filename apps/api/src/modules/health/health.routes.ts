import { Router } from "express";
import mongoose from "mongoose";
import { ok } from "../../utils/respond.js";

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness + DB connectivity check
 *     responses:
 *       200: { description: OK }
 */
healthRouter.get("/health", (_req, res) => {
  ok(res, {
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});
