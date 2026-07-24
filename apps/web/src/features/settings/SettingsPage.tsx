import { useState } from "react";
import { cn } from "@/lib/cn";
import { ProfileForm } from "./ProfileForm";
import { AccentPicker } from "./AccentPicker";
import { AreaBudgetsForm } from "./AreaBudgetsForm";
import { NotificationsMatrix } from "./NotificationsMatrix";
import { ApiKeysManager } from "./ApiKeysManager";
import { WebhooksManager } from "./WebhooksManager";
import { DataExportImport } from "./DataExportImport";
import { TrashBrowser } from "./TrashBrowser";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "budgets", label: "Area budgets" },
  { id: "notifications", label: "Notifications" },
  { id: "api-keys", label: "API keys" },
  { id: "webhooks", label: "Webhooks" },
  { id: "data", label: "Data" },
  { id: "trash", label: "Trash" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="flex gap-6">
      <nav className="w-40 shrink-0 space-y-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground", tab === t.id && "bg-accent text-foreground")}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "profile" && <ProfileForm />}
        {tab === "appearance" && <AccentPicker />}
        {tab === "budgets" && <AreaBudgetsForm />}
        {tab === "notifications" && <NotificationsMatrix />}
        {tab === "api-keys" && <ApiKeysManager />}
        {tab === "webhooks" && <WebhooksManager />}
        {tab === "data" && <DataExportImport />}
        {tab === "trash" && <TrashBrowser />}
      </div>
    </div>
  );
}
