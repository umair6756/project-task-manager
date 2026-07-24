import { create } from "zustand";

export interface PaletteAction {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  run: () => void;
}

interface PaletteState {
  actions: Map<string, PaletteAction>;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerAction: (action: PaletteAction) => () => void;
}

// Registry other features extend (Phase 10+ adds "create task", "goto
// project", etc.) without the palette component needing to know about them.
export const usePaletteStore = create<PaletteState>((set) => ({
  actions: new Map(),
  open: false,
  setOpen: (open) => set({ open }),
  registerAction: (action) => {
    set((state) => {
      const next = new Map(state.actions);
      next.set(action.id, action);
      return { actions: next };
    });
    return () =>
      set((state) => {
        const next = new Map(state.actions);
        next.delete(action.id);
        return { actions: next };
      });
  },
}));
