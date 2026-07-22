import type { NextFunction, Request, Response } from "express";

// WHAT: Wraps async route handlers so rejected promises reach errorHandler
// instead of crashing the process (Express 4 doesn't do this natively).
type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
