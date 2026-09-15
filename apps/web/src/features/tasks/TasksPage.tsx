import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, Inbox, KanbanSquare, ListTodo, Sparkles, SunMedium } from "lucide-react";
import { cn } from "@/lib/cn";
import { TaskListView } from "./TaskListView";
import { KanbanBoard } from "./KanbanBoard";
import { CalendarView } from "./CalendarView";
import { SavedFiltersBar } from "./SavedFiltersBar";
import { TodayViewPage } from "./views/TodayViewPage";
import { UpcomingViewPage } from "./views/UpcomingViewPage";
import { InboxViewPage } from "./views/InboxViewPage";
import { AnytimeViewPage } from "./views/AnytimeViewPage";
import { useTasks } from "./useTasks";

const TABS = [
  { id: "all", label: "All", icon: ListTodo },
  { id: "today", label: "Today", icon: SunMedium },
  { id: "upcoming", label: "Upcoming", icon: CalendarDays },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "anytime", label: "Anytime", icon: Sparkles },
  { id: "kanban", label: "Kanban", icon: KanbanSquare },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATUS_META: Record<string, { label: string; color: string }> = {
  todo: { label: "To do", color: "#a1a1aa" },
  "in-progress": { label: "In progress", color: "#3b82f6" },
  blocked: { label: "Blocked", color: "#ef4444" },
  done: { label: "Done", color: "#10b981" },
  cancelled: { label: "Cancelled", color: "#71717a" },
};

function StatusStrip() {
  const { data } = useTasks();
  const tasks = data?.tasks ?? [];
  if (tasks.length === 0) return null;

  const counts = Object.keys(STATUS_META).map((status) => ({
    status,
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <div className="h-20 w-full rounded-lg border border-border bg-card/40 p-2 sm:w-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={counts} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={70} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
            {counts.map((c) => (
              <Cell key={c.status} fill={c.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TasksPage() {
  const [tab, setTab] = useState<TabId>("all");

  return (
    <div className="space-y-4">
      <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {active && (
                  <motion.span
                    layoutId="tasks-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <StatusStrip />
      </div>

      {tab === "all" && <SavedFiltersBar />}

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {tab === "all" && <TaskListView />}
          {tab === "today" && <TodayViewPage />}
          {tab === "upcoming" && <UpcomingViewPage />}
          {tab === "inbox" && <InboxViewPage />}
          {tab === "anytime" && <AnytimeViewPage />}
          {tab === "kanban" && <KanbanBoard />}
          {tab === "calendar" && <CalendarView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
