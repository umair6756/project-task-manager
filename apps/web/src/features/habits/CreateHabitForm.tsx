import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateHabit } from "./useHabits";
import type { HabitScheduleKind } from "./types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CreateHabitForm({ onDone }: { onDone: () => void }) {
  const create = useCreateHabit();
  const [name, setName] = useState("");
  const [type, setType] = useState<"positive" | "negative">("positive");
  const [scheduleKind, setScheduleKind] = useState<HabitScheduleKind>("daily");
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set());
  const [quantTarget, setQuantTarget] = useState<number | "">("");

  function toggleWeekday(day: number) {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      type,
      schedule: {
        kind: scheduleKind,
        timesPerWeek: scheduleKind === "perWeek" ? timesPerWeek : undefined,
        weekdays: scheduleKind === "weekdays" ? Array.from(weekdays) : undefined,
      },
      quantTarget: quantTarget === "" ? undefined : quantTarget,
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" autoFocus />

      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as "positive" | "negative")} className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm">
          <option value="positive">Positive (do this)</option>
          <option value="negative">Negative (avoid this)</option>
        </select>
        <select value={scheduleKind} onChange={(e) => setScheduleKind(e.target.value as HabitScheduleKind)} className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm">
          <option value="daily">Daily</option>
          <option value="perWeek">X per week</option>
          <option value="weekdays">Specific weekdays</option>
        </select>
      </div>

      {scheduleKind === "perWeek" && (
        <div className="flex items-center gap-2 text-sm">
          <span>Times per week:</span>
          <Input type="number" min={1} max={7} value={timesPerWeek} onChange={(e) => setTimesPerWeek(Number(e.target.value))} className="w-16" />
        </div>
      )}

      {scheduleKind === "weekdays" && (
        <div className="flex gap-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleWeekday(i)}
              className={`rounded-md border px-2 py-1 text-xs ${weekdays.has(i) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <span>Quantified target (optional):</span>
        <Input
          type="number"
          min={0}
          value={quantTarget}
          onChange={(e) => setQuantTarget(e.target.value ? Number(e.target.value) : "")}
          placeholder="e.g. 8 glasses"
          className="w-28"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!name.trim() || create.isPending}>
          Create habit
        </Button>
      </div>
    </form>
  );
}
