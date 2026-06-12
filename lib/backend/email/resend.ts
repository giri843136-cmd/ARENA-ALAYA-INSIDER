/**
 * ALAYA INSIDER — Email Service (Resend)
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY missing — email sending gracefully skipped (no crash)');
    return { id: 'email-skipped-no-key', skipped: true };
  }

  try {
    return await resend.emails.send({
      from: "ALAYA INSIDER <hello@alayainsider.com>",
      to,
      subject,
      html,
      text,
    });
  } catch (error: any) {
    console.error('[Email] Resend send failed (graceful):', error.message);
    // Never crash the app on email failure
    return { id: 'email-failed', error: error.message, skipped: false };
  }
}

export async function sendMagicLink(email: string, url: string) {
  return sendTransactionalEmail({
    to: email,
    subject: "Sign in to ALAYA INSIDER",
    html: `<p>Click to sign in: <a href="${url}">${url}</a></p>`,
  });
}

export async function sendPublishingNotification(email: string, title: string) {
  return sendTransactionalEmail({
    to: email,
    subject: `Your content was published: ${title}`,
    html: `<p>Congratulations — your piece is now live on ALAYA.</p>`,
  });
}

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to ALAYA INSIDER",
    html: `<p>Hi ${name || ''}, welcome to the platform.</p>`,
  });
}

export async function sendCriticalAlert(email: string, message: string) {
  return sendTransactionalEmail({
    to: email,
    subject: "ALAYA Critical Alert",
    html: `<p>${message}</p>`,
  });
}
