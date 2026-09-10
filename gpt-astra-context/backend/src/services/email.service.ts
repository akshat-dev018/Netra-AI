import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

function transporter() {
  if (!env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });
}

export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  const from = env.EMAIL_FROM ?? 'noreply@localhost';
  const tx = transporter();
  if (!tx) {
    if (env.NODE_ENV !== 'production') {
      logger.info(`[email:dev] to=${to} subject=${subject} body=${text}`);
    }
    return;
  }
  await tx.sendMail({ from, to, subject, text });
}
