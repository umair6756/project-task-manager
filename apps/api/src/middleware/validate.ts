import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// WHAT: Generic zod-validation middleware factory. WHY: every module reuses
// this instead of hand-rolling input checks in controllers (rule #3 in
// CLAUDE.md — every endpoint is zod-validated).
type Target = "body" | "query" | "params";

export function validate(schema: ZodType, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[target]);
    (req as unknown as Record<Target, unknown>)[target] = parsed;
    next();
  };
}
