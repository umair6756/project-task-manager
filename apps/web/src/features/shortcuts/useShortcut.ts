import { useEffect } from "react";
import { useShortcutStore, type Shortcut } from "./shortcutStore";

// Parses a "mod+k" / "shift+?" style key combo against a KeyboardEvent.
// "mod" means Cmd on Mac, Ctrl elsewhere.
function matches(combo: string, e: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const needsMod = parts.includes("mod");
  const needsShift = parts.includes("shift");
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const modPressed = isMac ? e.metaKey : e.ctrlKey;
  if (needsMod && !modPressed) return false;
  if (needsShift && !e.shiftKey) return false;
  return e.key.toLowerCase() === key;
}

export function useShortcut(shortcut: Omit<Shortcut, "id"> & { id: string; enabled?: boolean }): void {
  const register = useShortcutStore((s) => s.register);

  useEffect(() => {
    if (shortcut.enabled === false) return;
    const unregister = register(shortcut);
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;
      if (typing && shortcut.keys !== "escape") return;
      if (matches(shortcut.keys, e)) {
        e.preventDefault();
        shortcut.handler();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut.id, shortcut.keys, shortcut.enabled]);
}
