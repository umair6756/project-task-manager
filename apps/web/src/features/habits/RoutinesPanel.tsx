import type React from "react";
import { useState } from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHabits } from "./useHabits";
import { useCreateRoutine, useDeleteRoutine, useRoutines } from "./useRoutines";
import { RoutineRunMode } from "./RoutineRunMode";
import type { Routine } from "./types";

export function RoutinesPanel() {
  const { data } = useRoutines();
  const { data: habitsData } = useHabits();
  const create = useCreateRoutine();
  const del = useDeleteRoutine();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState<Routine | null>(null);

  const routines = data?.routines ?? [];
  const habits = habitsData?.habits ?? [];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selected.size === 0) return;
    await create.mutateAsync({ name: name.trim(), habitIds: Array.from(selected) });
    setName("");
    setSelected(new Set());
    setShowForm(false);
  }

  if (running) return <RoutineRunMode routine={running} onClose={() => setRunning(null)} />;

  return (
    <div className="space-y-3">
      <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
        <Plus className="mr-1 h-3.5 w-3.5" /> New routine
      </Button>

      {showForm && (
        <form onSubmit={submit} className="space-y-2 rounded-lg border border-border p-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Routine name" autoFocus />
          <div className="flex flex-wrap gap-1.5">
            {habits.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => toggle(h.id)}
                className={`rounded-full border px-2.5 py-1 text-xs ${selected.has(h.id) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {h.name}
              </button>
            ))}
          </div>
          <Button type="submit" size="sm" disabled={!name.trim() || selected.size === 0}>
            Create
          </Button>
        </form>
      )}

      <ul className="space-y-1.5">
        {routines.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span>
              {r.name} <span className="text-xs text-muted-foreground">({r.habitIds.length} habits)</span>
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => setRunning(r)}>
                <Play className="mr-1 h-3.5 w-3.5" /> Run
              </Button>
              <button onClick={() => del.mutate(r.id)} aria-label="Delete routine">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </li>
        ))}
        {routines.length === 0 && <p className="text-sm text-muted-foreground">No routines yet.</p>}
      </ul>
    </div>
  );
}
