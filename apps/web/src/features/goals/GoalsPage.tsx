import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useGoals } from "./useGoals";
import { GoalCard } from "./GoalCard";
import { CreateGoalForm } from "./CreateGoalForm";
import type { GoalHorizon } from "./types";

const HORIZONS: { id: GoalHorizon | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "year", label: "Year" },
  { id: "quarter", label: "Quarter" },
  { id: "month", label: "Month" },
];

export function GoalsPage() {
  const [horizon, setHorizon] = useState<GoalHorizon | "all">("all");
  const { data } = useGoals(horizon === "all" ? undefined : horizon);
  const [showForm, setShowForm] = useState(false);

  const goals = (data?.goals ?? []).filter((g) => g.status === "active");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {HORIZONS.map((h) => (
            <button
              key={h.id}
              onClick={() => setHorizon(h.id)}
              className={cn("rounded-md px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground", horizon === h.id && "bg-accent text-foreground")}
            >
              {h.label}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
          New goal
        </Button>
      </div>

      {showForm && <CreateGoalForm onDone={() => setShowForm(false)} />}

      <div className="space-y-4">
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
        {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet.</p>}
      </div>
    </div>
  );
}
