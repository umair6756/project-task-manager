import type { Response } from "express";
import type { ApiResponse } from "@flowforge/shared";

// WHAT: Single place that shapes every success response into the
// { success, data, error } envelope so no route hand-rolls JSON shape.
export function ok<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
}
