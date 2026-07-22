// WHAT: Timer start/stop (one running timer per user, enforced) and manual
// entry overlap validation. Kept out of the controller so the "only one
// running timer" and "no overlapping manual entries" invariants live in
// exactly one place each.
import { TimeEntry, type TimeEntryDoc } from "./timeEntry.model.js";
import { AppError } from "../../utils/AppError.js";

export async function getRunningTimer(userId: string): Promise<TimeEntryDoc | null> {
  return TimeEntry.findOne({ userId, end: null });
}

export async function startTimer(
  userId: string,
  input: { taskId?: string | null; learningItemId?: string | null; note?: string },
): Promise<TimeEntryDoc> {
  const running = await getRunningTimer(userId);
  if (running) {
    throw AppError.conflict("A timer is already running", { runningTimer: running });
  }
  return TimeEntry.create({
    userId,
    taskId: input.taskId ?? null,
    learningItemId: input.learningItemId ?? null,
    note: input.note ?? "",
    source: "timer",
    start: new Date(),
    end: null,
  });
}

export async function stopTimer(userId: string): Promise<TimeEntryDoc> {
  const running = await getRunningTimer(userId);
  if (!running) throw AppError.notFound("No timer is running");
  running.end = new Date();
  await running.save();
  return running;
}

// Any two entries [start,end) for the same user must not overlap. A entry
// still running (end: null) is treated as extending to "now" for this
// check, so you can't backdate a manual entry into an active timer's span.
export async function assertNoOverlap(
  userId: string,
  start: Date,
  end: Date,
  excludeId?: string,
): Promise<void> {
  const filter: Record<string, unknown> = {
    userId,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    start: { $lt: end },
    $or: [{ end: { $gt: start } }, { end: null }],
  };
  const overlapping = await TimeEntry.findOne(filter);
  if (overlapping) {
    throw AppError.conflict("This time range overlaps an existing entry", { overlapsWith: overlapping });
  }
}
