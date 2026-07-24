import { cn } from "@/lib/cn";
import { useSettings, useUpdateSettings } from "./useProfile";

// Client-side preference toggles only — the backend always dispatches
// reminders/webhooks; this just controls which categories show a toast in
// this browser (stored in the free-form settings blob, per CLAUDE.md's
// user.settings design).
const CATEGORIES = [
  { key: "taskReminders", label: "Task reminders" },
  { key: "habitReminders", label: "Habit reminders" },
  { key: "certificateExpiry", label: "Certificate expiry" },
  { key: "weeklyReviewReady", label: "Weekly review ready" },
];

export function NotificationsMatrix() {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const notifications = data?.settings.notifications ?? {};

  function toggle(key: string) {
    update.mutate({ ...data?.settings, notifications: { ...notifications, [key]: notifications[key] === false ? true : false } });
  }

  return (
    <ul className="max-w-sm space-y-2">
      {CATEGORIES.map((c) => {
        const enabled = notifications[c.key] !== false;
        return (
          <li key={c.key} className="flex items-center justify-between text-sm">
            <span>{c.label}</span>
            <button
              onClick={() => toggle(c.key)}
              className={cn("h-5 w-9 rounded-full transition-colors", enabled ? "bg-primary" : "bg-secondary")}
            >
              <span className={cn("block h-4 w-4 rounded-full bg-background transition-transform", enabled ? "translate-x-4" : "translate-x-0.5")} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
