import { useState } from "react";
import { cn } from "@/lib/cn";
import { LearningDashboardStrip } from "./LearningDashboardStrip";
import { LearningItemsBoard } from "./LearningItemsBoard";
import { LearningItemPage } from "./LearningItemPage";
import { SkillsPanel } from "./SkillsPanel";
import { CertificatesGrid } from "./CertificatesGrid";
import { FlashcardsTab } from "./FlashcardsTab";

const TABS = [
  { id: "items", label: "Items" },
  { id: "skills", label: "Skills" },
  { id: "certificates", label: "Certificates" },
  { id: "flashcards", label: "Flashcards" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LearningPage() {
  const [tab, setTab] = useState<TabId>("items");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  if (openItemId) return <LearningItemPage itemId={openItemId} onBack={() => setOpenItemId(null)} />;

  return (
    <div className="space-y-4">
      <LearningDashboardStrip />

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

      {tab === "items" && <LearningItemsBoard onOpen={setOpenItemId} />}
      {tab === "skills" && <SkillsPanel />}
      {tab === "certificates" && <CertificatesGrid />}
      {tab === "flashcards" && <FlashcardsTab />}
    </div>
  );
}
