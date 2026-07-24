import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDeleteSavedFilter, useExecuteSavedFilter, useSavedFilters } from "./useSavedFilters";
import { SavedFilterBuilder } from "./SavedFilterBuilder";
import { SmartViewList } from "./SmartViewList";

export function SavedFiltersBar() {
  const { data } = useSavedFilters();
  const del = useDeleteSavedFilter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const { data: executed } = useExecuteSavedFilter(activeId);

  const filters = data?.filters ?? [];
  const active = filters.find((f) => f.id === activeId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveId(activeId === f.id ? null : f.id)}
            className={cn(
              "group flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
              activeId === f.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.name}
            <span
              onClick={(e) => {
                e.stopPropagation();
                del.mutate(f.id);
                if (activeId === f.id) setActiveId(null);
              }}
              className="opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        ))}
        <button onClick={() => setBuilding(true)} className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
          <Plus className="h-3 w-3" /> New filter
        </button>
      </div>

      {active && executed && <SmartViewList sections={[{ label: active.name, tasks: executed.tasks }]} />}

      {building && <SavedFilterBuilder onClose={() => setBuilding(false)} />}
    </div>
  );
}
