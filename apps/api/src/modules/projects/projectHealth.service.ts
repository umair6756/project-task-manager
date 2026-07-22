// WHAT: Project health heuristic (proposal #32) — compares actual progress
// against where progress "should" be given elapsed time toward the deadline.
//
// FORMULA (tune here — this is the one place it lives):
//   1. No deadline, or project already done/archived -> "on-track" (nothing
//      to be at risk against).
//   2. elapsedRatio = clamp((now - createdAt) / (deadline - createdAt), 0, 1)
//      expectedProgress = elapsedRatio * 100
//      deficit = expectedProgress - actualProgress
//   3. If the deadline has already passed and progress < 100 -> "off-track".
//   4. deficit <= 10   -> "on-track"   (roughly keeping pace)
//      deficit <= 25   -> "at-risk"    (falling behind schedule)
//      deficit  > 25   -> "off-track"  (significantly behind schedule)
export type ProjectHealth = "on-track" | "at-risk" | "off-track";

const AT_RISK_THRESHOLD = 10;
const OFF_TRACK_THRESHOLD = 25;

export function computeProjectHealth(
  createdAt: Date,
  deadline: Date | null,
  progress: number,
  status: string,
): ProjectHealth {
  if (!deadline || status === "done" || status === "archived") return "on-track";

  const now = Date.now();
  if (now > deadline.getTime() && progress < 100) return "off-track";

  const totalMs = deadline.getTime() - createdAt.getTime();
  const elapsedMs = now - createdAt.getTime();
  const elapsedRatio = totalMs <= 0 ? 1 : Math.min(1, Math.max(0, elapsedMs / totalMs));
  const expectedProgress = elapsedRatio * 100;
  const deficit = expectedProgress - progress;

  if (deficit <= AT_RISK_THRESHOLD) return "on-track";
  if (deficit <= OFF_TRACK_THRESHOLD) return "at-risk";
  return "off-track";
}
