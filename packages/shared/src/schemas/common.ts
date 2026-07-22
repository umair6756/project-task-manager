// WHAT: Shared primitives reused by every module's zod schemas (pagination,
// mongo id, sort order). WHY: keeps request validation consistent across the
// whole API and gives the frontend (Phase 9+) a single source of truth.
import { z } from "zod";

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

// Consistent API response envelope: { success, data, error }
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
