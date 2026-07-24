import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { LayoutDashboard, ListTodo, StickyNote, GraduationCap, Flame, Target, Timer, BarChart3, CalendarCheck, BookHeart } from "lucide-react";
import { XPFooter } from "@/features/gamification/XPFooter";

const modules = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/learning", label: "Learning", icon: GraduationCap },
  { to: "/habits", label: "Habits", icon: Flame },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/time", label: "Time", icon: Timer },
  { to: "/reviews", label: "Reviews", icon: CalendarCheck },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/50 px-3 py-4 md:flex">
      <div className="mb-6 px-2 text-lg font-semibold tracking-tight">FlowForge</div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {modules.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active && "bg-accent text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <XPFooter />
    </aside>
  );
}
