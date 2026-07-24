import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayView } from "@/features/tasks/useViews";
import { MoodEntry } from "@/features/journal/MoodEntry";
import { useShutdown } from "./usePlanning";

export function ShutdownFlow({ onClose }: { onClose: () => void }) {
  const { data: today } = useTodayView();
  const shutdown = useShutdown();
  const [step, setStep] = useState(0);
  const [shutdownNotes, setShutdownNotes] = useState("");
  const [tomorrowNotes, setTomorrowNotes] = useState("");

  const remaining = today ? [...today.overdue, ...today.dueToday].length : 0;

  async function finish() {
    await shutdown.mutateAsync({ shutdownNotes, tomorrowNotes });
    setStep(3);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Shutdown ritual</h2>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm">You have {remaining} task{remaining === 1 ? "" : "s"} still open today.</p>
            <textarea
              value={shutdownNotes}
              onChange={(e) => setShutdownNotes(e.target.value)}
              placeholder="How did today go?"
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            <Button size="sm" onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <MoodEntry />
            <Button size="sm" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <textarea
              value={tomorrowNotes}
              onChange={(e) => setTomorrowNotes(e.target.value)}
              placeholder="Plan for tomorrow..."
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            <Button size="sm" onClick={() => void finish()} disabled={shutdown.isPending}>
              Finish shutdown
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="py-4 text-center">
            <p className="text-3xl">🌙</p>
            <p className="mt-2 text-sm font-medium">Shutdown complete. Rest well.</p>
            <Button size="sm" className="mt-3" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
