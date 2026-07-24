import { useState } from "react";
import { cn } from "@/lib/cn";
import { TrendsDashboard } from "./TrendsDashboard";
import { ProjectFlowDashboard } from "./ProjectFlowDashboard";
import { AchievementsGallery } from "@/features/gamification/AchievementsGallery";

const TABS = [
  { id: "trends", label: "Trends" },
  { id: "projects", label: "Project flow" },
  { id: "achievements", label: "Achievements" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AnalyticsPage() {
  const [tab, setTab] = useState<TabId>("trends");

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

      {tab === "trends" && <TrendsDashboard />}
      {tab === "projects" && <ProjectFlowDashboard />}
      {tab === "achievements" && <AchievementsGallery />}
    </div>
  );
}
