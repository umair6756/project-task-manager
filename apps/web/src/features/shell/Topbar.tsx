import { Link } from "@tanstack/react-router";
import { Search, Sun, Moon, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaletteStore } from "@/features/commandPalette/paletteStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/features/auth/useAuth";
import { TimerWidget } from "@/features/time/TimerWidget";
import { NotificationsCenter } from "@/features/notifications/NotificationsCenter";

export function Topbar() {
  const setPaletteOpen = usePaletteStore((s) => s.setOpen);
  const { theme, toggle } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <button
        onClick={() => setPaletteOpen(true)}
        className="flex w-72 items-center gap-2 rounded-md border border-input bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
      >
        <Search className="h-4 w-4" />
        Search or jump to...
        <kbd className="ml-auto text-xs">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <TimerWidget />
        <NotificationsCenter />
        <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Link to="/settings" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent" title="Settings">
          <Settings className="h-4 w-4" />
        </Link>
        <div className="mx-2 h-5 w-px bg-border" />
        <span className="text-sm text-muted-foreground">{user?.name}</span>
        <Button variant="ghost" size="icon" onClick={logout} title="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
