import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckinHabit, useHabits } from "./useHabits";
import { useCompleteRun, useStartRun } from "./useRoutines";
import type { Routine } from "./types";

export function RoutineRunMode({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const { data } = useHabits();
  const checkin = useCheckinHabit();
  const startRun = useStartRun();
  const completeRun = useCompleteRun();
  const [runId, setRunId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());

  const habits = (data?.habits ?? []).filter((h) => routine.habitIds.includes(h.id));
  const current = habits[index];

  useEffect(() => {
    void startRun.mutateAsync(routine.id).then((res) => setRunId(res.run.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine.id]);

  useEffect(() => {
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [index]);

  async function next() {
    if (current) {
      await checkin.mutateAsync({ id: current.id });
      setDone((prev) => new Set(prev).add(current.id));
    }
    if (index + 1 >= habits.length) {
      if (runId) void completeRun.mutateAsync({ routineId: routine.id, runId });
      onClose();
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">
          {Math.min(index + 1, habits.length)} / {habits.length} — {routine.name}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {current ? (
          <>
            <h1 className="text-2xl font-semibold">{current.name}</h1>
            <p className="font-mono text-4xl tabular-nums text-muted-foreground">
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
            </p>
            <Button size="lg" onClick={() => void next()}>
              <Check className="mr-2 h-4 w-4" /> Done, next
            </Button>
          </>
        ) : (
          <p className="text-lg font-medium">Routine complete</p>
        )}
      </div>

      <div className="flex justify-center gap-1.5 p-4">
        {habits.map((h) => (
          <div key={h.id} className={`h-1.5 w-8 rounded-full ${done.has(h.id) ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>
    </div>
  );
}
