import { useState } from "react";
import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNotes } from "./useNotes";

// Simplified wiki-link helper: search existing notes and append "[[Title]]"
// to the content. A true in-editor "[[" autocomplete would need a custom
// CodeMirror extension — out of scope for this pass; this covers the same
// end result (a working wiki-link) with much less code.
export function WikiLinkInserter({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data } = useNotes();

  const matches = (data?.notes ?? []).filter((n) => n.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-md p-1.5 hover:bg-accent" title="Insert wiki-link">
        <Link2 className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-md border border-border bg-card p-2 shadow-lg">
          <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes..." className="mb-2 h-7 text-xs" />
          <ul className="max-h-40 space-y-0.5 overflow-y-auto">
            {matches.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    onInsert(`[[${n.title}]]`);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full truncate rounded px-2 py-1 text-left text-xs hover:bg-accent"
                >
                  {n.title}
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-2 py-1 text-xs text-muted-foreground">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
