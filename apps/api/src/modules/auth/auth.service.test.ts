import { describe, it, expect, vi } from "vitest";
import * as authService from "./auth.service.js";

// Mock the email sender to capture the reset URL instead of actually sending,
// so we can drive the full forgot -> reset -> login-with-new-password path.
vi.mock("../../utils/email.js", () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }));

describe("auth.service password reset (happy path)", () => {
  it("issues a working reset token that changes the password and revokes sessions", async () => {
    const { sendEmail } = await import("../../utils/email.js");
    const { user, tokens } = await authService.register({
      email: "reset@example.com",
      password: "oldpassword1",
      name: "Reset Test",
    });

    await authService.forgotPassword(user.email);
    expect(sendEmail).toHaveBeenCalledOnce();
    const html = (sendEmail as ReturnType<typeof vi.fn>).mock.calls[0][2] as string;
    const token = /token=([a-f0-9]+)/.exec(html)?.[1];
    expect(token).toBeTruthy();

    await authService.resetPassword(token as string, "newpassword2");

    // Old refresh token session must be revoked by the reset.
    await expect(authService.refresh(tokens.refreshToken)).rejects.toThrow();

    // New password logs in successfully.
    const loginResult = await authService.login({ email: user.email, password: "newpassword2" });
    expect(loginResult.tokens.accessToken).toBeTruthy();

    // Reusing the same reset token fails (single-use).
    await expect(authService.resetPassword(token as string, "another12")).rejects.toThrow();
  });
});
