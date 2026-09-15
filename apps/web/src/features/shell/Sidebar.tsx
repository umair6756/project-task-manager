import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { XPFooter } from "@/features/gamification/XPFooter";
import { MODULES } from "./modules";

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/50 px-3 py-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-fuchsia-500 text-xs font-bold text-primary-foreground">
          F
        </span>
        <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-lg font-semibold tracking-tight text-transparent">FlowForge</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {MODULES.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground",
                active && "text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md bg-accent shadow-[0_0_0_1px_hsl(var(--border))]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>
      <XPFooter />
    </aside>
  );
}
