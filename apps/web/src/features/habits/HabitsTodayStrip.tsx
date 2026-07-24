import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCheckinHabit, useHabits } from "./useHabits";

export function HabitsTodayStrip() {
  const { data } = useHabits();
  const checkin = useCheckinHabit();
  const habits = data?.habits ?? [];

  if (habits.length === 0) return <p className="text-sm text-muted-foreground">No habits yet — add one from the Habits page.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {habits.map((h) => (
        <button
          key={h.id}
          onClick={() => checkin.mutate({ id: h.id })}
          className={cn("flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs hover:border-primary")}
        >
          <Check className="h-3 w-3" />
          {h.name}
          <span className="flex items-center gap-0.5 text-muted-foreground">
            <Flame className="h-2.5 w-2.5 text-orange-400" /> {h.currentStreak}
          </span>
        </button>
      ))}
    </div>
  );
}
