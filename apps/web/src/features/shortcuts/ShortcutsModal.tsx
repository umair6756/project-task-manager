import { useShortcutStore } from "./shortcutStore";
import { useShortcut } from "./useShortcut";
import { useState } from "react";

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);
  const shortcuts = useShortcutStore((s) => Array.from(s.shortcuts.values()));

  useShortcut({ id: "shortcuts-modal", keys: "shift+?", description: "Show keyboard shortcuts", handler: () => setOpen((v) => !v) });
  useShortcut({ id: "shortcuts-modal-close", keys: "escape", description: "Close", handler: () => setOpen(false), enabled: open });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">Keyboard shortcuts</h2>
        <ul className="space-y-2">
          {shortcuts.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-xs">{s.keys}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
