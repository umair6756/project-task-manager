import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBatchUpdateTasks } from "@/features/tasks/useTasks";
import { currentIsoWeek } from "./isoWeek";
import { useSaveWeeklyReview, useWeeklyReview } from "./useReviews";

const STEPS = ["Recap", "Reflections", "Overdue triage", "Goals", "Done"] as const;

export function WeeklyReviewWizard() {
  const [isoWeek] = useState(currentIsoWeek());
  const { data } = useWeeklyReview(isoWeek);
  const save = useSaveWeeklyReview();
  const batchUpdate = useBatchUpdateTasks();
  const [step, setStep] = useState(0);
  const [wentWell, setWentWell] = useState("");
  const [didntGoWell, setDidntGoWell] = useState("");
  const [lessons, setLessons] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function rescheduleSelected(days: number) {
    if (selected.size === 0) return;
    const dueAt = new Date(Date.now() + days * 86400000).toISOString();
    await batchUpdate.mutateAsync({ ids: Array.from(selected), set: { dueAt } });
    setSelected(new Set());
  }

  async function finish() {
    await save.mutateAsync({ isoWeek, input: { wentWell, didntGoWell, lessons } });
    setStep(4);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? "font-medium text-foreground" : ""}>
            {s}
            {i < STEPS.length - 1 && <span className="mx-1">→</span>}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold">Week {isoWeek} recap</h2>
          <p className="text-sm">
            Completed <span className="font-medium">{data.completedStats.total}</span> tasks
          </p>
          <p className="text-sm">
            Inbox: <span className="font-medium">{data.inboxCount}</span> uncategorized
          </p>
          <div>
            <p className="mb-1 text-xs uppercase text-muted-foreground">Habit rates</p>
            {data.habitRates.map((h) => (
              <p key={h.habitId} className="text-sm">
                {h.name}: {h.rate}%
              </p>
            ))}
          </div>
          <Button onClick={() => setStep(1)}>Continue</Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold">Reflections</h2>
          {data.prompts.slice(0, 1).map((p) => (
            <p key={p} className="text-sm text-muted-foreground">
              {p}
            </p>
          ))}
          <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} placeholder="What went well?" rows={2} className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none" />
          <textarea value={didntGoWell} onChange={(e) => setDidntGoWell(e.target.value)} placeholder="What didn't go well?" rows={2} className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none" />
          <textarea value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="Lessons learned?" rows={2} className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none" />
          <Button onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold">Overdue triage ({data.overdue.length})</h2>
          <ul className="max-h-52 space-y-1 overflow-y-auto">
            {data.overdue.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
                <span className="truncate">{t.title}</span>
              </li>
            ))}
            {data.overdue.length === 0 && <p className="text-sm text-muted-foreground">Nothing overdue. 🎉</p>}
          </ul>
          {data.overdue.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => void rescheduleSelected(1)}>
                Reschedule → tomorrow
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void rescheduleSelected(7)}>
                Reschedule → next week
              </Button>
            </div>
          )}
          <Button onClick={() => setStep(3)}>Continue</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold">Goals</h2>
          {data.goalStatuses.map((g) => (
            <div key={g.goalId} className="flex items-center justify-between text-sm">
              <span>{g.title}</span>
              <span className="text-muted-foreground">
                {g.progress}% · {g.trafficLight}
              </span>
            </div>
          ))}
          {data.goalStatuses.length === 0 && <p className="text-sm text-muted-foreground">No active goals.</p>}
          <Button onClick={() => void finish()} disabled={save.isPending}>
            Finish review
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2 rounded-lg border border-border p-8 text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="text-lg font-semibold">Weekly review complete!</h2>
          <p className="text-sm text-muted-foreground">See you next week.</p>
        </div>
      )}
    </div>
  );
}
