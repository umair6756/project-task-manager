// WHAT: Weekly job body — emails every user their past week's review
// package as an HTML summary (proposal #173).
import { User } from "../modules/users/user.model.js";
import { buildReviewPackage } from "../modules/reviews/reviewAggregation.service.js";
import { sendEmail } from "../utils/email.js";

function renderHtml(pkg: Awaited<ReturnType<typeof buildReviewPackage>>): string {
  return `
    <h1>Your week in FlowForge</h1>
    <p><strong>${pkg.completedStats.total}</strong> tasks completed.</p>
    <p>Inbox: ${pkg.inboxCount} items waiting for triage.</p>
    <p>Overdue: ${pkg.overdue.length} tasks.</p>
    <h2>Habits</h2>
    <ul>${pkg.habitRates.map((h) => `<li>${h.name}: ${h.rate}%</li>`).join("")}</ul>
    <h2>Goals</h2>
    <ul>${pkg.goalStatuses.map((g) => `<li>${g.title}: ${g.progress}% (${g.trafficLight})</li>`).join("")}</ul>
  `;
}

export async function sendWeeklyEmailReports(): Promise<number> {
  const users = await User.find({ deletedAt: null }).select("_id email");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  for (const user of users) {
    const pkg = await buildReviewPackage(String(user._id), weekAgo, now);
    await sendEmail(user.email, "Your FlowForge weekly report", renderHtml(pkg));
  }
  return users.length;
}
