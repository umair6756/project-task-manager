import { useEffect, type DependencyList } from "react";
import { usePaletteStore, type PaletteAction } from "./paletteStore";

export function useRegisterAction(action: PaletteAction, deps: DependencyList = []): void {
  const registerAction = usePaletteStore((s) => s.registerAction);
  useEffect(() => registerAction(action), deps); // eslint-disable-line react-hooks/exhaustive-deps
}
