import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, ListTodo, StickyNote, Flame, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { MODULES } from "./modules";

const BOTTOM_ITEMS = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/habits", label: "Habits", icon: Flame },
] as const;

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-border bg-card/95 backdrop-blur md:hidden">
      {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link key={to} to={to} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] text-muted-foreground">
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            <span className={cn(active && "font-medium text-foreground")}>{label}</span>
            {active && <motion.span layoutId="mobile-nav-dot" className="absolute -top-0.5 h-1 w-1 rounded-full bg-primary" />}
          </Link>
        );
      })}
      <button onClick={onMore} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] text-muted-foreground">
        <Menu className="h-5 w-5" />
        More
      </button>
    </nav>
  );
}

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card p-4 shadow-2xl md:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-lg font-semibold text-transparent">FlowForge</span>
              <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
              {MODULES.map(({ to, label, icon: Icon }) => {
                const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                      active && "bg-accent text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
