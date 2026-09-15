import { Snowflake } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useGamificationMe } from "./useGamification";

export function XPFooter() {
  const { data } = useGamificationMe();
  if (!data) return null;

  const { levelInfo, freezeTokensAvailable } = data;
  const pct = Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100));

  return (
    <div className="flex items-center gap-2.5 border-t border-border px-3 py-2.5">
      <ProgressRing pct={pct} size={34} stroke={3} label={String(levelInfo.level)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] text-muted-foreground">
          {levelInfo.xpIntoLevel} / {levelInfo.xpForNextLevel} XP
        </p>
        {freezeTokensAvailable > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title={`${freezeTokensAvailable} streak-freeze tokens`}>
            <Snowflake className="h-3 w-3" /> {freezeTokensAvailable}
          </span>
        )}
      </div>
    </div>
  );
}
