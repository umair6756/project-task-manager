// WHAT: Scans all tasks for due, unsent reminders and turns each into a
// Notification (+ socket emit, wired by the caller). Idempotent per
// reminder: sentAt is stamped atomically in the same query that selects it.
import { Task } from "../modules/tasks/task.model.js";
import { Notification } from "../modules/notifications/notification.model.js";
import type { Server as SocketIOServer } from "socket.io";

export async function dispatchDueReminders(io?: SocketIOServer): Promise<number> {
  const now = new Date();
  const tasks = await Task.find({
    status: { $nin: ["done", "cancelled"] },
    "reminders.remindAt": { $lte: now },
    "reminders.sentAt": null,
  });

  let dispatched = 0;
  for (const task of tasks) {
    for (const reminder of task.reminders) {
      const isDue = reminder.remindAt.getTime() <= now.getTime() && !reminder.sentAt;
      const isSnoozed = reminder.snoozedUntil && reminder.snoozedUntil.getTime() > now.getTime();
      if (!isDue || isSnoozed) continue;

      reminder.sentAt = now;
      const notification = await Notification.create({
        userId: task.userId,
        type: "task.reminder",
        title: task.title,
        body: "Reminder due",
        entityType: "Task",
        entityId: task._id,
      });
      io?.to(String(task.userId)).emit("notification.new", notification.toObject());
      dispatched++;
    }
    await task.save();
  }
  return dispatched;
}
