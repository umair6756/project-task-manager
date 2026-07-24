import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "./useGlobalSearch";
import type { SearchResult } from "./useGlobalSearch";

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  task: "Tasks",
  note: "Notes",
  project: "Projects",
  learningItem: "Learning",
};

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGlobalSearch(query);

  const results = data?.results ?? [];
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks, notes, projects, learning items..." className="pl-9" autoFocus />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
      {query.trim().length > 1 && !isLoading && results.length === 0 && <p className="text-sm text-muted-foreground">No results.</p>}

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h3 className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">{TYPE_LABELS[type as SearchResult["type"]]}</h3>
          <ul className="space-y-1">
            {items.map((r) => (
              <li key={r.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {r.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
