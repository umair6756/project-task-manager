import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useDeleteTimeEntry, useTimeEntries } from "./useTimeEntries";

export function TimeEntriesList() {
  const { data } = useTimeEntries();
  const del = useDeleteTimeEntry();
  const entries = data?.entries ?? [];

  return (
    <ul className="space-y-1.5">
      {entries.map((e) => {
        const minutes = e.end ? Math.round((new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000) : null;
        return (
          <li key={e.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <div>
              <p>{format(new Date(e.start), "MMM d, HH:mm")}{minutes !== null ? ` · ${minutes}m` : " · running"}</p>
              <p className="text-xs text-muted-foreground">
                {e.source}
                {e.note ? ` — ${e.note}` : ""}
              </p>
            </div>
            <button onClick={() => del.mutate(e.id)} aria-label="Delete entry">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </li>
        );
      })}
      {entries.length === 0 && <p className="text-sm text-muted-foreground">No time entries yet.</p>}
    </ul>
  );
}
