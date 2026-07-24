import { useState } from "react";
import { Check, Flame, SkipForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useCheckinHabit, useDeleteHabit, useHabitStrength, useSkipHabit } from "./useHabits";
import { HabitHeatmap } from "./HabitHeatmap";
import { SkipDialog } from "./SkipDialog";
import type { Habit } from "./types";

export function HabitCard({ habit }: { habit: Habit }) {
  const checkin = useCheckinHabit();
  const skip = useSkipHabit();
  const del = useDeleteHabit();
  const { data: strengthData } = useHabitStrength(habit.id);
  const [showSkip, setShowSkip] = useState(false);
  const [justChecked, setJustChecked] = useState(false);
  const [quantValue, setQuantValue] = useState(habit.quantTarget ?? 1);

  async function doCheckin() {
    await checkin.mutateAsync({ id: habit.id, value: habit.quantTarget ? quantValue : undefined });
    setJustChecked(true);
    setTimeout(() => setJustChecked(false), 600);
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{habit.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3 w-3 text-orange-400" /> {habit.currentStreak}d streak (best {habit.bestStreak})
            {strengthData && <span className="ml-2">· {strengthData.strength}/100</span>}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {habit.quantTarget && (
            <input
              type="number"
              min={0}
              value={quantValue}
              onChange={(e) => setQuantValue(Number(e.target.value))}
              className="h-8 w-14 rounded-md border border-input bg-transparent px-1.5 text-center text-xs"
            />
          )}
          <button
            onClick={() => void doCheckin()}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
              justChecked ? "scale-110 border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary",
            )}
            aria-label="Check in"
          >
            <Check className="h-4 w-4" />
          </button>
          <Button variant="ghost" size="icon" onClick={() => setShowSkip(true)} title="Skip today">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => del.mutate(habit.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="mt-2.5">
        <HabitHeatmap habitId={habit.id} />
      </div>

      {showSkip && (
        <SkipDialog
          onCancel={() => setShowSkip(false)}
          onConfirm={(reason) => {
            skip.mutate({ id: habit.id, reason: reason || undefined });
            setShowSkip(false);
          }}
        />
      )}
    </div>
  );
}
