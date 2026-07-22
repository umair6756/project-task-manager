// WHAT: Thin email-sending wrapper. WHY: in dev (no SMTP configured) we log
// the email to the console instead of sending, so password-reset/reminder
// flows are fully testable without a real mail provider.
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const info = await getTransporter().sendMail({ from: env.EMAIL_FROM, to, subject, html });
  if (!env.SMTP_HOST) {
    logger.info({ to, subject, html }, "[dev email] " + (info.messageId ?? ""));
  }
}
