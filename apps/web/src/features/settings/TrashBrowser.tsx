import { formatDistanceToNow } from "date-fns";
import { RotateCcw, Trash2 } from "lucide-react";
import { useRestoreTrashItem, useTrash, usePurgeTrashItem } from "@/features/platform/useTrash";

export function TrashBrowser() {
  const { data } = useTrash();
  const restore = useRestoreTrashItem();
  const purge = usePurgeTrashItem();
  const items = data?.items ?? [];

  return (
    <div className="max-w-lg space-y-1.5">
      <p className="text-xs text-muted-foreground">Deleted items are kept for 30 days, then purged automatically.</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={`${item.model}-${item.id}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate">{item.data.title ?? item.data.name ?? item.id}</p>
              <p className="text-xs text-muted-foreground">
                {item.model} · deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => restore.mutate({ model: item.model, id: item.id })} title="Restore" className="p-1">
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </button>
              <button onClick={() => purge.mutate({ model: item.model, id: item.id })} title="Delete permanently" className="p-1">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Trash is empty.</p>}
      </ul>
    </div>
  );
}
