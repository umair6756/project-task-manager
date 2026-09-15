import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Lightweight CSS-only tooltip — no extra dependency needed.
export function Tooltip({ label, children, side = "bottom", className }: { label: string; children: ReactNode; side?: "top" | "bottom"; className?: string }) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-lg transition-all duration-150 group-hover/tip:opacity-100",
          side === "bottom" ? "top-full mt-2 group-hover/tip:translate-y-0 translate-y-1" : "bottom-full mb-2 group-hover/tip:translate-y-0 -translate-y-1",
        )}
      >
        {label}
      </span>
    </span>
  );
}
