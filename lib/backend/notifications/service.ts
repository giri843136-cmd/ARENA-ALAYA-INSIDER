/**
 * ALAYA INSIDER — Notification Service
 */

import { prisma } from "@/lib/db/prisma";
import { NotificationType } from "@prisma/client";
import { sendTransactionalEmail } from "../email/resend";

export async function createNotification({
  userId,
  type,
  title,
  body,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: any;
}) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, data },
  });

  // Also send email for important types
  if (["PRICE_DROP", "AFFILIATE_ALERT", "SECURITY"].includes(type)) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendTransactionalEmail({
        to: user.email,
        subject: title,
        html: `<p>${body || title}</p>`,
      });
    }
  }

  return notification;
}
