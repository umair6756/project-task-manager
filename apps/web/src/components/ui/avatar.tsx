import { cn } from "@/lib/cn";

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0]?.toUpperCase() || "?";
}

export function Avatar({ name, className }: { name?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-xs font-semibold text-primary-foreground shadow-sm",
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
