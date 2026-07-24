import { useState } from "react";
import { cn } from "@/lib/cn";
import { WeeklyReviewWizard } from "./WeeklyReviewWizard";
import { MonthlyReviewPage } from "./MonthlyReviewPage";
import { YearInReviewPage } from "./YearInReviewPage";

const TABS = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "year", label: "Year in review" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ReviewsPage() {
  const [tab, setTab] = useState<TabId>("weekly");

  return (
    <div className="space-y-4">
      <div className="mx-auto flex max-w-xl items-center gap-1 border-b border-border">
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

      {tab === "weekly" && <WeeklyReviewWizard />}
      {tab === "monthly" && <MonthlyReviewPage />}
      {tab === "year" && <YearInReviewPage />}
    </div>
  );
}
