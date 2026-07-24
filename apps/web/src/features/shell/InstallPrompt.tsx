import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("flowforge.installDismissed") === "1");

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || dismissed) return null;

  async function install() {
    await deferred?.prompt();
    setDeferred(null);
  }

  function dismiss() {
    sessionStorage.setItem("flowforge.installDismissed", "1");
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-sm">Install FlowForge for quick access and offline reading.</p>
      <Button size="sm" onClick={() => void install()}>
        <Download className="mr-1 h-3.5 w-3.5" /> Install
      </Button>
      <button onClick={dismiss} aria-label="Dismiss">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
