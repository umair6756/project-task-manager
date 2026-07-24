import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMarkNotificationRead, useNotificationsList } from "./useNotifications";

export function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const { data } = useNotificationsList();
  const markRead = useMarkNotificationRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-md p-2 hover:bg-accent" title="Notifications">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
            <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase text-muted-foreground">Notifications</div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.readAt && markRead.mutate(n.id)}
                  className={cn("block w-full border-b border-border/50 px-3 py-2.5 text-left hover:bg-accent/50", !n.readAt && "bg-accent/30")}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
