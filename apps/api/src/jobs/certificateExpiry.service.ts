// WHAT: Daily job body — notifies once per certificate when it's within 30
// days of expiring. Idempotent via expiryReminderSentAt.
import { Certificate } from "../modules/learning/certificate.model.js";
import { Notification } from "../modules/notifications/notification.model.js";

export async function checkCertificateExpiries(): Promise<number> {
  const horizon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const certificates = await Certificate.find({
    expiresAt: { $ne: null, $lte: horizon },
    expiryReminderSentAt: null,
  });

  for (const cert of certificates) {
    await Notification.create({
      userId: cert.userId,
      type: "certificate.expiring",
      title: `${cert.title} expires soon`,
      body: `Expires ${cert.expiresAt?.toDateString()}`,
      entityType: "Certificate",
      entityId: cert._id,
    });
    cert.expiryReminderSentAt = new Date();
    await cert.save();
  }

  return certificates.length;
}
