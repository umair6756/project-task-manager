import { Snowflake } from "lucide-react";
import { useGamificationMe } from "./useGamification";

export function XPFooter() {
  const { data } = useGamificationMe();
  if (!data) return null;

  const { levelInfo, freezeTokensAvailable } = data;
  const pct = Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100));

  return (
    <div className="space-y-1.5 border-t border-border px-3 py-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Lv {levelInfo.level}</span>
        {freezeTokensAvailable > 0 && (
          <span className="flex items-center gap-1 text-muted-foreground" title={`${freezeTokensAvailable} streak-freeze tokens`}>
            <Snowflake className="h-3 w-3" /> {freezeTokensAvailable}
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {levelInfo.xpIntoLevel} / {levelInfo.xpForNextLevel} XP
      </p>
    </div>
  );
}
