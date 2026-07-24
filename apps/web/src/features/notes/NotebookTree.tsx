import type React from "react";
import { useState } from "react";
import { Plus, Notebook as NotebookIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCreateNotebook, useNotebooks } from "./useNotebooks";
import type { Notebook } from "./types";

interface Props {
  selectedId: string | null | "all";
  onSelect: (id: string | null | "all") => void;
}

function buildTree(notebooks: Notebook[], parentId: string | null): Notebook[] {
  return notebooks.filter((n) => n.parentId === parentId);
}

function NotebookNode({ notebook, all, selectedId, onSelect, depth }: { notebook: Notebook; all: Notebook[]; selectedId: string | null | "all"; onSelect: (id: string) => void; depth: number }) {
  const children = buildTree(all, notebook.id);
  return (
    <div>
      <button
        onClick={() => onSelect(notebook.id)}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm hover:bg-accent",
          selectedId === notebook.id && "bg-accent font-medium",
        )}
      >
        <NotebookIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{notebook.name}</span>
      </button>
      {children.map((c) => (
        <NotebookNode key={c.id} notebook={c} all={all} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  );
}

export function NotebookTree({ selectedId, onSelect }: Props) {
  const { data } = useNotebooks();
  const create = useCreateNotebook();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const notebooks = data?.notebooks ?? [];
  const roots = buildTree(notebooks, null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim() });
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex w-52 shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">Notebooks</span>
        <button onClick={() => setAdding((v) => !v)} className="rounded p-1 hover:bg-accent">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        onClick={() => onSelect("all")}
        className={cn("mx-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent", selectedId === "all" && "bg-accent font-medium")}
      >
        All notes
      </button>

      {adding && (
        <form onSubmit={submit} className="px-2 py-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !name && setAdding(false)}
            placeholder="Notebook name"
            className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {roots.map((n) => (
          <NotebookNode key={n.id} notebook={n} all={notebooks} selectedId={selectedId} onSelect={onSelect} depth={0} />
        ))}
      </div>
    </div>
  );
}
