import { useEffect } from "react";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

// Registered once, outside React, so a fast-refresh or remount never
// double-registers the service worker.
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

export function PwaUpdatePrompt() {
  useEffect(() => {
    if (updateSW) return;
    updateSW = registerSW({
      onNeedRefresh() {
        toast("A new version of FlowForge is available.", {
          action: { label: "Reload", onClick: () => void updateSW?.(true) },
          duration: Infinity,
        });
      },
      onOfflineReady() {
        toast.success("FlowForge is ready to work offline.");
      },
    });
  }, []);

  return null;
}
