// WHAT: All auth business logic (register/login/refresh-rotation/logout/
// password reset). WHY: controllers stay thin; this is what CLAUDE.md's
// "services own ALL business logic" rule means in practice.
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { User, type UserDoc } from "../users/user.model.js";
import { RefreshToken } from "./refreshToken.model.js";
import { PasswordResetToken } from "./passwordResetToken.model.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./tokens.js";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import { sendEmail } from "../../utils/email.js";
import type { RegisterInput, LoginInput } from "@flowforge/shared";

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function refreshTtlMs(): number {
  // Parse simple "7d" / "15m" style TTL strings used by JWT_REFRESH_TTL.
  const match = /^(\d+)([smhd])$/.exec(env.JWT_REFRESH_TTL);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit as "s" | "m" | "h" | "d"];
  return value * unitMs;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function issueTokenPair(userId: string, familyId?: string): Promise<AuthTokens> {
  const family = familyId ?? crypto.randomUUID();
  const accessToken = signAccessToken(userId);
  // jti placeholder swapped for the real doc id right after insert, since the
  // refresh token itself needs to embed the doc's id for fast lookup.
  const doc = await RefreshToken.create({
    userId,
    tokenHash: "pending",
    familyId: family,
    expiresAt: new Date(Date.now() + refreshTtlMs()),
  });
  const refreshToken = signRefreshToken(userId, doc.id as string);
  doc.tokenHash = hashToken(refreshToken);
  await doc.save();
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<{ user: UserDoc; tokens: AuthTokens }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw AppError.conflict("Email already registered");

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const user = await User.create({ email: input.email, passwordHash, name: input.name });
  const tokens = await issueTokenPair(user.id as string);
  return { user, tokens };
}

export async function login(input: LoginInput): Promise<{ user: UserDoc; tokens: AuthTokens }> {
  const user = await User.findOne({ email: input.email, deletedAt: null });
  if (!user) throw AppError.unauthorized("Invalid email or password");

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) throw AppError.unauthorized("Invalid email or password");

  const tokens = await issueTokenPair(user.id as string);
  return { user, tokens };
}

// Rotation: verify signature, look up the stored doc by jti, confirm hash
// matches (defends against a stolen-but-unsigned token) and isn't revoked.
// Reuse of an already-rotated token revokes the whole family (theft signal).
export async function refresh(rawToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw AppError.unauthorized("Invalid refresh token");
  }

  const doc = await RefreshToken.findById(payload.jti);
  if (!doc || doc.tokenHash !== hashToken(rawToken)) {
    throw AppError.unauthorized("Invalid refresh token");
  }
  if (doc.revokedAt) {
    // Reused token from a rotated-out family — revoke every token in it.
    await RefreshToken.updateMany(
      { familyId: doc.familyId, revokedAt: null },
      { revokedAt: new Date() },
    );
    throw AppError.unauthorized("Refresh token reuse detected; session revoked");
  }
  if (doc.expiresAt.getTime() < Date.now()) {
    throw AppError.unauthorized("Refresh token expired");
  }

  const tokens = await issueTokenPair(doc.userId.toString(), doc.familyId);
  doc.revokedAt = new Date();
  doc.replacedByTokenHash = hashToken(tokens.refreshToken);
  await doc.save();
  return tokens;
}

export async function logout(rawToken: string): Promise<void> {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    return; // already invalid — logout is idempotent
  }
  await RefreshToken.updateOne(
    { _id: payload.jti, revokedAt: null },
    { revokedAt: new Date() },
  );
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email, deletedAt: null });
  // Always resolve silently — do not leak whether an email is registered.
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
  });

  const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${rawToken}`;
  await sendEmail(
    user.email,
    "Reset your FlowForge password",
    `<p>Click to reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>Expires in 1 hour.</p>`,
  );
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const doc = await PasswordResetToken.findOne({ tokenHash: hashToken(rawToken), usedAt: null });
  if (!doc || doc.expiresAt.getTime() < Date.now()) {
    throw AppError.badRequest("Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  await User.updateOne({ _id: doc.userId }, { passwordHash });
  doc.usedAt = new Date();
  await doc.save();
  // Revoke all active sessions on password reset.
  await RefreshToken.updateMany({ userId: doc.userId, revokedAt: null }, { revokedAt: new Date() });
}
