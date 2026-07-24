import { useState } from "react";
import { Archive, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrafficLightBadge } from "./TrafficLightBadge";
import { KeyResultRow } from "./KeyResultRow";
import { CreateKeyResultForm } from "./CreateKeyResultForm";
import { CheckInDialog } from "./CheckInDialog";
import { useArchiveGoal, useDeleteGoal } from "./useGoals";
import type { Goal } from "./types";

export function GoalCard({ goal }: { goal: Goal }) {
  const archive = useArchiveGoal();
  const del = useDeleteGoal();
  const [showKrForm, setShowKrForm] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">{goal.horizon}</p>
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          {goal.theme && <p className="text-sm text-muted-foreground">{goal.theme}</p>}
        </div>
        <div className="flex items-center gap-1">
          <TrafficLightBadge status={goal.trafficLight} />
          {goal.status === "active" && (
            <Button variant="ghost" size="icon" onClick={() => archive.mutate({ id: goal.id })} title="Archive">
              <Archive className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => del.mutate(goal.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${goal.progress}%` }} />
      </div>

      <div className="space-y-2">
        {goal.keyResults.map((kr) => (
          <KeyResultRow key={kr.id} goalId={goal.id} kr={kr} />
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowKrForm((v) => !v)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Key result
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowCheckIn(true)}>
          Check in
        </Button>
      </div>

      {showKrForm && (
        <div className="mt-3">
          <CreateKeyResultForm goalId={goal.id} onDone={() => setShowKrForm(false)} />
        </div>
      )}

      {showCheckIn && <CheckInDialog goalId={goal.id} keyResults={goal.keyResults} onClose={() => setShowCheckIn(false)} />}
    </div>
  );
}
