import { Input } from "@/components/ui/input";
import { useAreas } from "./useAreas";
import { useSettings, useUpdateSettings } from "./useProfile";

export function AreaBudgetsForm() {
  const { data: areasData } = useAreas();
  const { data: settingsData } = useSettings();
  const update = useUpdateSettings();

  const areas = areasData?.areas ?? [];
  const budgets = settingsData?.settings.areaBudgets ?? {};

  function setBudget(areaId: string, hours: number) {
    update.mutate({ ...settingsData?.settings, areaBudgets: { ...budgets, [areaId]: hours } });
  }

  if (areas.length === 0) return <p className="text-sm text-muted-foreground">No areas yet — create one from Tasks/Projects first.</p>;

  return (
    <div className="max-w-sm space-y-2">
      {areas.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-2">
          <span className="text-sm">{a.name}</span>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              value={budgets[a.id] ?? ""}
              onChange={(e) => setBudget(a.id, Number(e.target.value))}
              placeholder="0"
              className="h-8 w-20 text-sm"
            />
            <span className="text-xs text-muted-foreground">hrs/wk</span>
          </div>
        </div>
      ))}
    </div>
  );
}
