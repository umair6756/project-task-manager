import { useState } from "react";
import type React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export interface ChecklistLikeItem {
  title?: string;
  text?: string;
  done: boolean;
}

// Shared editor for Task.subtasks ({title,done}) and Task.checklist
// ({text,done}) — both are full-array-replace on PATCH (no per-item
// endpoints), so every change here sends the whole edited array back.
export function ChecklistEditor<T extends ChecklistLikeItem>({
  label,
  items,
  labelKey,
  onChange,
}: {
  label: string;
  items: T[];
  labelKey: "title" | "text";
  onChange: (next: T[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onChange([...items, { [labelKey]: draft.trim(), done: false } as unknown as T]);
    setDraft("");
  }

  function toggle(index: number) {
    onChange(items.map((item, i) => (i === index ? { ...item, done: !item.done } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <button
              onClick={() => toggle(i)}
              className={cn(
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border",
                item.done ? "border-primary bg-primary" : "border-muted-foreground/50",
              )}
              aria-label="Toggle done"
            />
            <span className={cn("flex-1 truncate", item.done && "text-muted-foreground line-through")}>{item[labelKey]}</span>
            <button onClick={() => remove(i)} aria-label="Remove">
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={addItem} className="flex items-center gap-1.5">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Add ${label.toLowerCase()}...`} className="h-7 text-xs" />
        <button type="submit" className="rounded-md p-1 hover:bg-accent" aria-label={`Add ${label}`}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
