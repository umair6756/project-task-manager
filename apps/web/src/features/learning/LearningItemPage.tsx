import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddProgress, useDeleteLearningItem, useLearningItem, useUpdateLearningItem } from "./useLearningItems";

export function LearningItemPage({ itemId, onBack }: { itemId: string; onBack: () => void }) {
  const { data } = useLearningItem(itemId);
  const addProgress = useAddProgress();
  const update = useUpdateLearningItem();
  const del = useDeleteLearningItem();
  const [takeaways, setTakeaways] = useState("");

  const item = data?.item;

  useEffect(() => {
    if (item) setTakeaways(item.takeaways ?? "");
  }, [item?.id, item?.takeaways]);

  if (!item) return <p className="p-4 text-sm text-muted-foreground">Loading...</p>;

  const pct = item.progressTarget ? Math.min(100, Math.round((item.progressCurrent / item.progressTarget) * 100)) : 0;

  function bump(delta: number) {
    if (!item) return;
    addProgress.mutate({ id: item.id, value: Math.max(0, item.progressCurrent + delta) });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button variant="ghost" size="icon" onClick={() => del.mutate(item.id, { onSuccess: onBack })}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div>
        <p className="text-xs uppercase text-muted-foreground">{item.type}</p>
        <h1 className="text-xl font-semibold">{item.title}</h1>
        {item.source && <p className="text-sm text-muted-foreground">{item.source}</p>}
      </div>

      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span>
            Progress ({item.progressUnit}): {item.progressCurrent} / {item.progressTarget}
          </span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => bump(item.progressUnit === "percent" ? 10 : 1)}>
            +{item.progressUnit === "percent" ? 10 : 1}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bump(item.progressUnit === "percent" ? -10 : -1)}>
            -{item.progressUnit === "percent" ? 10 : 1}
          </Button>
          <select
            value={item.status}
            onChange={(e) => update.mutate({ id: item.id, patch: { status: e.target.value as typeof item.status } })}
            className="ml-auto rounded-md border border-input bg-transparent px-2 text-xs"
          >
            {["wishlist", "learning", "completed", "abandoned"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {item.sections.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Sections</p>
          <ul className="space-y-1">
            {item.sections.map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={s.done} readOnly className="h-3.5 w-3.5" />
                <span className={s.done ? "text-muted-foreground line-through" : ""}>{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Takeaways</p>
        <textarea
          value={takeaways}
          onChange={(e) => setTakeaways(e.target.value)}
          onBlur={() => takeaways !== item.takeaways && update.mutate({ id: item.id, patch: { takeaways } })}
          rows={5}
          placeholder="Key takeaways..."
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {item.progressHistory.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">History</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {item.progressHistory
              .slice()
              .reverse()
              .slice(0, 10)
              .map((h, i) => (
                <li key={i}>
                  {new Date(h.createdAt).toLocaleDateString()} — {h.value}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
