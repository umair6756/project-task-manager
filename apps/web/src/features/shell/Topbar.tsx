import { Link } from "@tanstack/react-router";
import { Search, Sun, Moon, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { usePaletteStore } from "@/features/commandPalette/paletteStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/features/auth/useAuth";
import { TimerWidget } from "@/features/time/TimerWidget";
import { NotificationsCenter } from "@/features/notifications/NotificationsCenter";

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const setPaletteOpen = usePaletteStore((s) => s.setOpen);
  const { theme, toggle } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onOpenMobileNav && (
          <button onClick={onOpenMobileNav} className="rounded-md p-2 hover:bg-accent md:hidden" aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex w-full max-w-72 items-center gap-2 rounded-md border border-input bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground transition-shadow hover:bg-secondary hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search or jump to...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="ml-auto hidden text-xs sm:inline">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <TimerWidget />
        <NotificationsCenter />
        <Tooltip label="Toggle theme">
          <Button variant="ghost" size="icon" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Tooltip>
        <Tooltip label="Settings">
          <Link to="/settings" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent" title="Settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Tooltip>
        <div className="mx-2 hidden h-5 w-px bg-border sm:block" />
        <Avatar name={user?.name} className="hidden sm:flex" />
        <span className="hidden text-sm text-muted-foreground lg:inline">{user?.name}</span>
        <Tooltip label="Log out">
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
