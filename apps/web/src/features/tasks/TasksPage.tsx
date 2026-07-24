import { useState } from "react";
import { cn } from "@/lib/cn";
import { TaskListView } from "./TaskListView";
import { KanbanBoard } from "./KanbanBoard";
import { CalendarView } from "./CalendarView";
import { SavedFiltersBar } from "./SavedFiltersBar";
import { TodayViewPage } from "./views/TodayViewPage";
import { UpcomingViewPage } from "./views/UpcomingViewPage";
import { InboxViewPage } from "./views/InboxViewPage";
import { AnytimeViewPage } from "./views/AnytimeViewPage";

const TABS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "inbox", label: "Inbox" },
  { id: "anytime", label: "Anytime" },
  { id: "kanban", label: "Kanban" },
  { id: "calendar", label: "Calendar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TasksPage() {
  const [tab, setTab] = useState<TabId>("all");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
              tab === t.id && "border-primary text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "all" && <SavedFiltersBar />}

      {tab === "all" && <TaskListView />}
      {tab === "today" && <TodayViewPage />}
      {tab === "upcoming" && <UpcomingViewPage />}
      {tab === "inbox" && <InboxViewPage />}
      {tab === "anytime" && <AnytimeViewPage />}
      {tab === "kanban" && <KanbanBoard />}
      {tab === "calendar" && <CalendarView />}
    </div>
  );
}
