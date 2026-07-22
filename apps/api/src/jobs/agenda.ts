// WHAT: Agenda (Mongo-backed job queue) setup — reminder dispatch every 5
// minutes, fixed-recurrence materialization hourly. Only started from
// index.ts's production runtime, never in tests (which drive services
// directly instead of through the scheduler).
import Agenda from "agenda";
import type { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { dispatchDueReminders } from "./reminderDispatch.service.js";
import { runFixedRecurrenceSpawner } from "./recurrenceSpawner.service.js";
import { checkCertificateExpiries } from "./certificateExpiry.service.js";
import { recomputeAllBoundKeyResults } from "./keyResultRecompute.service.js";
import { sendWeeklyEmailReports } from "./weeklyEmailReport.service.js";
import { runDailySnapshot } from "./dailySnapshot.service.js";
import { deliverPendingWebhooks } from "../modules/platform/webhook.service.js";

export function createAgenda(io: SocketIOServer): Agenda {
  const agenda = new Agenda({ db: { address: env.MONGO_URI, collection: "agendaJobs" } });

  agenda.define("dispatch-due-reminders", async () => {
    const count = await dispatchDueReminders(io);
    if (count > 0) logger.info({ count }, "dispatched due reminders");
  });

  agenda.define("materialize-fixed-recurrence", async () => {
    const count = await runFixedRecurrenceSpawner();
    if (count > 0) logger.info({ count }, "materialized fixed-recurrence occurrences");
  });

  agenda.define("check-certificate-expiries", async () => {
    const count = await checkCertificateExpiries();
    if (count > 0) logger.info({ count }, "sent certificate expiry reminders");
  });

  agenda.define("recompute-kr-bindings", async () => {
    const count = await recomputeAllBoundKeyResults();
    if (count > 0) logger.info({ count }, "recomputed bound key results");
  });

  agenda.define("send-weekly-email-reports", async () => {
    const count = await sendWeeklyEmailReports();
    logger.info({ count }, "sent weekly email reports");
  });

  agenda.define("daily-snapshot", async () => {
    const count = await runDailySnapshot();
    logger.info({ count }, "ran daily productivity-score snapshot");
  });

  agenda.define("deliver-webhooks", async () => {
    const count = await deliverPendingWebhooks();
    if (count > 0) logger.info({ count }, "delivered webhooks");
  });

  agenda.on("ready", async () => {
    await agenda.every("5 minutes", "dispatch-due-reminders");
    await agenda.every("1 hour", "materialize-fixed-recurrence");
    await agenda.every("1 day", "check-certificate-expiries");
    await agenda.every("1 hour", "recompute-kr-bindings");
    await agenda.every("1 week", "send-weekly-email-reports");
    await agenda.every("1 day", "daily-snapshot");
    await agenda.every("1 minute", "deliver-webhooks");
    await agenda.start();
    logger.info("agenda jobs scheduled");
  });

  return agenda;
}
