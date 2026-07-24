import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useSettings, useUpdateSettings } from "./useProfile";

const PRESETS = [
  { name: "Violet", value: "258 90% 66%" },
  { name: "Blue", value: "217 91% 60%" },
  { name: "Green", value: "142 71% 45%" },
  { name: "Orange", value: "25 95% 53%" },
  { name: "Pink", value: "330 81% 60%" },
  { name: "Red", value: "0 72% 51%" },
];

export function applyAccent(value: string): void {
  document.documentElement.style.setProperty("--primary", value);
  document.documentElement.style.setProperty("--ring", value);
}

export function AccentPicker() {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const accent = data?.settings.accent ?? PRESETS[0]!.value;

  useEffect(() => {
    if (data?.settings.accent) applyAccent(data.settings.accent);
  }, [data?.settings.accent]);

  function choose(value: string) {
    applyAccent(value);
    update.mutate({ ...data?.settings, accent: value });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => choose(p.value)}
          title={p.name}
          className={cn("h-8 w-8 rounded-full border-2", accent === p.value ? "border-foreground" : "border-transparent")}
          style={{ backgroundColor: `hsl(${p.value})` }}
        />
      ))}
    </div>
  );
}
