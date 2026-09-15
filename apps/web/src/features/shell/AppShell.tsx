import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav, MobileDrawer } from "./MobileNav";
import { TopProgressBar } from "./TopProgressBar";
import { CommandPalette } from "@/features/commandPalette/CommandPalette";
import { ShortcutsModal } from "@/features/shortcuts/ShortcutsModal";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/apiClient";
import { connectSocket, getSocket } from "@/lib/socket";
import { useSettings } from "@/features/settings/useProfile";
import { applyAccent } from "@/features/settings/AccentPicker";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";
import { InstallPrompt } from "./InstallPrompt";
import type { AuthUser } from "@/stores/authStore";

// On a hard refresh we only have the refresh token persisted (access token
// lives in memory only) — silently mint a fresh access token + fetch the
// profile before rendering the authenticated shell.
function useBootstrapSession() {
  const { user, accessToken, refreshToken, setSession } = useAuthStore();

  useEffect(() => {
    if (user || accessToken || !refreshToken) return;
    void (async () => {
      try {
        const tokens = await api.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", { refreshToken });
        const me = await api.get<{ user: AuthUser }>("/auth/me");
        setSession(me.user, tokens.accessToken, tokens.refreshToken);
      } catch {
        useAuthStore.getState().clear();
      }
    })();
  }, [user, accessToken, refreshToken, setSession]);
}

function useNotificationSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket() ?? connectSocket(accessToken);
    function onNotification(payload: { title: string; body?: string }) {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      toast(payload.title, { description: payload.body });
    }
    socket.on("notification.new", onNotification);
    return () => {
      socket.off("notification.new", onNotification);
    };
  }, [accessToken, qc]);
}

function useAppliedAccent() {
  const { data } = useSettings();
  useEffect(() => {
    if (data?.settings.accent) applyAccent(data.settings.accent);
  }, [data?.settings.accent]);
}

export function AppShell({ children }: { children: ReactNode }) {
  useBootstrapSession();
  useNotificationSocket();
  useAppliedAccent();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <TopProgressBar />
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileBottomNav onMore={() => setMobileNavOpen(true)} />
      <MobileDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CommandPalette />
      <ShortcutsModal />
      <PwaUpdatePrompt />
      <InstallPrompt />
    </div>
  );
}
