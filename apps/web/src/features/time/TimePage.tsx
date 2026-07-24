import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { TimeEntriesList } from "./TimeEntriesList";
import { ManualEntryDialog } from "./ManualEntryDialog";
import { PomodoroFocusMode } from "./PomodoroFocusMode";
import { ReportsPage } from "./ReportsPage";

const TABS = [
  { id: "entries", label: "Entries" },
  { id: "reports", label: "Reports" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TimePage() {
  const [tab, setTab] = useState<TabId>("entries");
  const [showManual, setShowManual] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);

  if (showPomodoro) return <PomodoroFocusMode onClose={() => setShowPomodoro(false)} />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
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
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowManual(true)}>
            Manual entry
          </Button>
          <Button size="sm" onClick={() => setShowPomodoro(true)}>
            Start pomodoro
          </Button>
        </div>
      </div>

      {tab === "entries" && <TimeEntriesList />}
      {tab === "reports" && <ReportsPage />}

      {showManual && <ManualEntryDialog onClose={() => setShowManual(false)} />}
    </div>
  );
}
