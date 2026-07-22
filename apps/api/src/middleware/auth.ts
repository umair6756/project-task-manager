import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/tokens.js";
import { verifyApiKey } from "../modules/platform/apiKey.service.js";
import { AppError } from "../utils/AppError.js";

// WHAT: Populates req.userId from either a Bearer access token or a
// personal API key (X-API-Key header, proposal #17 — scripting/
// automation). WHY: single choke point every protected route depends on;
// every future module's queries are scoped by this userId (multi-user-
// ready rule in CLAUDE.md).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const apiKeyHeader = req.headers["x-api-key"];
  if (typeof apiKeyHeader === "string") {
    const apiKey = await verifyApiKey(apiKeyHeader);
    if (!apiKey) {
      next(AppError.unauthorized("Invalid API key"));
      return;
    }
    req.userId = String(apiKey.userId);
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(AppError.unauthorized("Missing bearer token"));
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired access token"));
  }
}
