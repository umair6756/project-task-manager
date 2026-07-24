import { useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { usePaletteStore } from "./paletteStore";
import { useRegisterAction } from "./useRegisterAction";
import { useShortcut } from "@/features/shortcuts/useShortcut";
import { useGlobalSearch } from "@/features/search/useGlobalSearch";

const SEARCH_ROUTE: Record<string, string> = {
  task: "/tasks",
  note: "/notes",
  project: "/tasks",
  learningItem: "/learning",
};

export function CommandPalette() {
  const open = usePaletteStore((s) => s.open);
  const setOpen = usePaletteStore((s) => s.setOpen);
  const actions = usePaletteStore((s) => Array.from(s.actions.values()));
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const search = useGlobalSearch(query);

  useShortcut({
    id: "palette-open",
    keys: "mod+k",
    description: "Open command palette",
    handler: () => usePaletteStore.getState().setOpen(!usePaletteStore.getState().open),
  });

  useRegisterAction({ id: "nav-home", label: "Go to Dashboard", group: "Navigate", run: () => void navigate({ to: "/" }) }, [navigate]);
  useRegisterAction({ id: "nav-tasks", label: "Go to Tasks", group: "Navigate", shortcut: "q", run: () => void navigate({ to: "/tasks" }) }, [navigate]);
  useRegisterAction({ id: "nav-settings", label: "Go to Settings", group: "Navigate", run: () => void navigate({ to: "/settings" }) }, [navigate]);
  useRegisterAction({ id: "nav-search", label: "Go to Search", group: "Navigate", run: () => void navigate({ to: "/search" }) }, [navigate]);

  const groups = new Map<string, typeof actions>();
  for (const action of actions) {
    const list = groups.get(action.group) ?? [];
    list.push(action);
    groups.set(action.group, list);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
    >
      <Command.Input
        autoFocus
        value={query}
        onValueChange={setQuery}
        placeholder="Type a command or search..."
        className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
        {(search.data?.results.length ?? 0) > 0 && (
          <Command.Group heading="Search results" className="px-2 py-1.5 text-xs font-medium uppercase text-muted-foreground">
            {search.data?.results.slice(0, 8).map((r) => (
              <Command.Item
                key={`${r.type}-${r.id}`}
                value={`search-${r.type}-${r.id}`}
                onSelect={() => {
                  void navigate({ to: SEARCH_ROUTE[r.type] ?? "/" });
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent"
              >
                <span className="truncate">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.type}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
        {Array.from(groups.entries()).map(([group, items]) => (
          <Command.Group key={group} heading={group} className="px-2 py-1.5 text-xs font-medium uppercase text-muted-foreground">
            {items.map((action) => (
              <Command.Item
                key={action.id}
                onSelect={() => {
                  action.run();
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent"
              >
                <span>{action.label}</span>
                {action.shortcut && <kbd className="text-xs text-muted-foreground">{action.shortcut}</kbd>}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
