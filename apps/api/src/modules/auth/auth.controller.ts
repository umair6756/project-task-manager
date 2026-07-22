import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { User } from "../users/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../utils/AppError.js";

function serializeUser(user: { id: string; email: string; name: string; timezone: string; weekStartDay: number; dayEndHour: number; avatarUrl?: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    weekStartDay: user.weekStartDay,
    dayEndHour: user.dayEndHour,
    avatarUrl: user.avatarUrl ?? null,
  };
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.register(req.body);
  ok(res, { user: serializeUser(user), ...tokens }, 201);
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.login(req.body);
  ok(res, { user: serializeUser(user), ...tokens });
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const tokens = await authService.refresh(req.body.refreshToken);
  ok(res, tokens);
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  await authService.logout(req.body.refreshToken);
  ok(res, { loggedOut: true });
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  await authService.forgotPassword(req.body.email);
  ok(res, { sent: true });
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  await authService.resetPassword(req.body.token, req.body.password);
  ok(res, { reset: true });
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const user = await User.findOne({ _id: req.userId, deletedAt: null });
  if (!user) throw AppError.notFound("User not found");
  ok(res, { user: serializeUser(user) });
}
