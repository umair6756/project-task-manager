import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useHabits } from "./useHabits";
import { HabitCard } from "./HabitCard";
import { CreateHabitForm } from "./CreateHabitForm";
import { RoutinesPanel } from "./RoutinesPanel";

const TABS = [
  { id: "habits", label: "Habits" },
  { id: "routines", label: "Routines" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function HabitsPage() {
  const { data } = useHabits();
  const [tab, setTab] = useState<TabId>("habits");
  const [showForm, setShowForm] = useState(false);

  const habits = data?.habits ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
              tab === t.id && "border-primary text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "habits" && (
        <div className="space-y-3">
          <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
            New habit
          </Button>
          {showForm && <CreateHabitForm onDone={() => setShowForm(false)} />}
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
          {habits.length === 0 && <p className="text-sm text-muted-foreground">No habits yet.</p>}
        </div>
      )}

      {tab === "routines" && <RoutinesPanel />}
    </div>
  );
}
