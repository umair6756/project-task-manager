import { create } from "zustand";

export interface Shortcut {
  id: string;
  keys: string;
  description: string;
  handler: () => void;
}

interface ShortcutState {
  shortcuts: Map<string, Shortcut>;
  register: (shortcut: Shortcut) => () => void;
}

// Global registry so features can add shortcuts without the shell knowing
// about them ahead of time. Components register on mount, unregister on
// unmount via the returned cleanup function.
export const useShortcutStore = create<ShortcutState>((set, get) => ({
  shortcuts: new Map(),
  register: (shortcut) => {
    set((state) => {
      const next = new Map(state.shortcuts);
      next.set(shortcut.id, shortcut);
      return { shortcuts: next };
    });
    return () => {
      set((state) => {
        const next = new Map(state.shortcuts);
        next.delete(shortcut.id);
        return { shortcuts: next };
      });
    };
  },
}));

export function listShortcuts(): Shortcut[] {
  return Array.from(useShortcutStore.getState().shortcuts.values());
}
