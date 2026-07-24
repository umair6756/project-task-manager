import { useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import { useDeleteKeyResult, useUpdateKeyResult } from "./useGoals";
import type { KeyResult } from "./types";

const BINDING_LABELS: Record<string, string> = {
  tasksCompletedInProject: "Auto: project tasks",
  habitCompletionRate: "Auto: habit rate",
  learningHours: "Auto: learning hours",
};

export function KeyResultRow({ goalId, kr }: { goalId: string; kr: KeyResult }) {
  const update = useUpdateKeyResult();
  const del = useDeleteKeyResult();
  const [value, setValue] = useState(kr.currentValue);

  const pct = kr.type === "boolean" ? (kr.currentValue >= kr.targetValue ? 100 : 0) : Math.min(100, Math.round(((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue || 1)) * 100));

  function commit() {
    if (value !== kr.currentValue) update.mutate({ goalId, keyResultId: kr.id, patch: { currentValue: value } });
  }

  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-sm">{kr.title}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {kr.binding && (
            <span className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
              <Link2 className="h-2.5 w-2.5" /> {BINDING_LABELS[kr.binding.kind]}
            </span>
          )}
          <button onClick={() => del.mutate({ goalId, keyResultId: kr.id })} aria-label="Delete key result">
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {kr.currentValue} / {kr.targetValue} {kr.type === "percent" ? "%" : ""}
        </span>
        {!kr.binding &&
          (kr.type === "boolean" ? (
            <button onClick={() => update.mutate({ goalId, keyResultId: kr.id, patch: { currentValue: kr.currentValue >= kr.targetValue ? 0 : kr.targetValue } })} className="text-primary hover:underline">
              {kr.currentValue >= kr.targetValue ? "Mark incomplete" : "Mark done"}
            </button>
          ) : (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              onBlur={commit}
              className="w-16 rounded border border-input bg-transparent px-1 py-0.5 text-right text-xs"
            />
          ))}
      </div>
    </div>
  );
}
