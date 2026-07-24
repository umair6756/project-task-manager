import { useEffect, useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRunningTimer, useStartTimer, useStopTimer } from "./useTimeEntries";

function formatElapsed(startIso: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export function TimerWidget() {
  const { data } = useRunningTimer();
  const start = useStartTimer();
  const stop = useStopTimer();
  const [, forceTick] = useState(0);

  const running = data?.running ?? null;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  if (!running) {
    return (
      <Button variant="ghost" size="icon" onClick={() => start.mutate({})} title="Start timer">
        <Play className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs">
      <span className="font-mono tabular-nums text-primary">{formatElapsed(running.start)}</span>
      <button onClick={() => stop.mutate()} aria-label="Stop timer" className="rounded p-0.5 hover:bg-primary/20">
        <Square className="h-3 w-3 text-primary" />
      </button>
    </div>
  );
}
