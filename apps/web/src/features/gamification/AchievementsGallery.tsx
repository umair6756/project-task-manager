import { useState } from "react";
import { Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { useGamificationMe } from "./useGamification";

export function AchievementsGallery() {
  const { data } = useGamificationMe();
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  const achievements = data?.achievements ?? [];
  const filtered = achievements.filter((a) => (filter === "all" ? true : filter === "earned" ? a.earned : !a.earned));
  const categories = [...new Set(filtered.map((a) => a.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {(["all", "earned", "locked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("rounded-md px-2.5 py-1 text-xs capitalize text-muted-foreground hover:text-foreground", filter === f && "bg-accent text-foreground")}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {achievements.filter((a) => a.earned).length} / {achievements.length} earned
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">{cat}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered
              .filter((a) => a.category === cat)
              .map((a) => (
                <div
                  key={a.key}
                  className={cn("flex items-start gap-2 rounded-md border p-2.5 text-xs", a.earned ? "border-primary/40 bg-primary/5" : "border-border opacity-60")}
                >
                  {a.earned ? <Trophy className="h-4 w-4 shrink-0 text-yellow-400" /> : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.name}</p>
                    <p className="text-muted-foreground">
                      {a.earned ? `+${a.xpReward} XP` : `${a.currentValue} / ${a.threshold}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
