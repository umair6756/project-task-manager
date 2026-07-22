import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../config/logger.js";
import type { ApiError } from "@flowforge/shared";

// WHAT: Terminal error middleware. Converts AppError/ZodError/unknown errors
// into the standard envelope. WHY: every controller can just `throw` and let
// this be the single place that decides status codes + logging.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details: err.issues },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.status).json(body);
    return;
  }

  // Mongo duplicate-key error (E11000) — surface as 409 instead of a 500,
  // since it's a client-correctable conflict (e.g. label name already used).
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    const body: ApiError = {
      success: false,
      error: { code: "CONFLICT", message: "Duplicate value violates a unique constraint" },
    };
    res.status(409).json(body);
    return;
  }

  logger.error({ err }, "unhandled error");
  const body: ApiError = {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  };
  res.status(500).json(body);
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiError = {
    success: false,
    error: { code: "NOT_FOUND", message: `No route: ${req.method} ${req.path}` },
  };
  res.status(404).json(body);
}
