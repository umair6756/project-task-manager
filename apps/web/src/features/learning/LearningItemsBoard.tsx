import type React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useCreateLearningItem, useLearningItems } from "./useLearningItems";
import type { LearningItemStatus, LearningItemType } from "./types";

const COLUMNS: { status: LearningItemStatus; label: string }[] = [
  { status: "wishlist", label: "Wishlist" },
  { status: "learning", label: "Learning" },
  { status: "completed", label: "Completed" },
  { status: "abandoned", label: "Abandoned" },
];

const TYPES: LearningItemType[] = ["course", "book", "video", "article", "tutorial"];

export function LearningItemsBoard({ onOpen }: { onOpen: (id: string) => void }) {
  const { data } = useLearningItems();
  const create = useCreateLearningItem();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LearningItemType>("course");

  const items = data?.items ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({ type, title: title.trim(), status: "wishlist", progressUnit: "percent" });
    setTitle("");
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add item
      </Button>

      {showForm && (
        <form onSubmit={submit} className="flex gap-2 rounded-md border border-border p-3">
          <select value={type} onChange={(e) => setType(e.target.value as LearningItemType)} className="rounded-md border border-input bg-transparent px-2 text-sm">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1" autoFocus />
          <Button type="submit" size="sm" disabled={!title.trim()}>
            Add
          </Button>
        </form>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const group = items.filter((i) => i.status === col.status);
          return (
            <div key={col.status} className="flex w-64 shrink-0 flex-col rounded-lg border border-border bg-card/40 p-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">{col.label}</span>
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{group.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {group.map((item) => (
                  <button key={item.id} onClick={() => onOpen(item.id)} className="rounded-md border border-border bg-background p-2.5 text-left text-sm">
                    <p className="truncate">{item.title}</p>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn("h-full bg-primary")}
                        style={{ width: `${Math.min(100, item.progressTarget ? (item.progressCurrent / item.progressTarget) * 100 : 0)}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
