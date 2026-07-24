import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useCompleteCycle, useStartPomodoro, useStopPomodoro } from "./usePomodoro";
import type { PomodoroSession } from "./types";

type Phase = "work" | "break";

export function PomodoroFocusMode({ onClose }: { onClose: () => void }) {
  const start = useStartPomodoro();
  const completeCycle = useCompleteCycle();
  const stop = useStopPomodoro();
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    void start.mutateAsync({}).then((res) => {
      setSession(res.session);
      setSecondsLeft(res.session.workLenMin * 60);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          void advancePhase();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, phase]);

  async function advancePhase() {
    if (!session) return;
    if (phase === "work") {
      const res = await completeCycle.mutateAsync(session.id);
      setSession(res.session);
      if (res.session.completedAt) {
        onClose();
        return;
      }
      setPhase("break");
      setSecondsLeft(session.breakLenMin * 60);
    } else {
      setPhase("work");
      setSecondsLeft(session.workLenMin * 60);
    }
  }

  async function endEarly() {
    if (session) await stop.mutateAsync(session.id);
    onClose();
  }

  if (!session) return null;

  const total = phase === "work" ? session.workLenMin * 60 : session.breakLenMin * 60;
  const progress = 1 - secondsLeft / total;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <button onClick={() => void endEarly()} className="absolute right-4 top-4 rounded-md p-2 hover:bg-accent">
        <X className="h-5 w-5" />
      </button>

      <p className="mb-2 text-sm uppercase tracking-wide text-muted-foreground">{phase === "work" ? "Focus" : "Break"}</p>

      <svg width={220} height={220} className="-rotate-90">
        <circle cx={110} cy={110} r={radius} stroke="hsl(var(--secondary))" strokeWidth={8} fill="none" />
        <circle
          cx={110}
          cy={110}
          r={radius}
          stroke={phase === "work" ? "hsl(var(--primary))" : "hsl(142 71% 45%)"}
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <p className="-mt-[140px] font-mono text-4xl tabular-nums">
        {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
      </p>

      <div className="mt-16 flex gap-2">
        {Array.from({ length: session.cycles }).map((_, i) => (
          <div key={i} className={cn("h-2.5 w-2.5 rounded-full", i < session.currentCycle - 1 || (i === session.currentCycle - 1 && phase === "break") ? "bg-primary" : "bg-secondary")} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Cycle {session.currentCycle} / {session.cycles}
      </p>

      <Button variant="ghost" size="sm" className="mt-6" onClick={() => void endEarly()}>
        End session
      </Button>
    </div>
  );
}
