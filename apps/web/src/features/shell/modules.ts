import { LayoutDashboard, ListTodo, StickyNote, GraduationCap, Flame, Target, Timer, BarChart3, CalendarCheck, BookHeart } from "lucide-react";

export const MODULES = [
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
