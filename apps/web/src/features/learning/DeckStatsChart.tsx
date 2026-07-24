import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useDeckStats } from "./useDecks";

export function DeckStatsChart({ deckId }: { deckId: string }) {
  const { data } = useDeckStats(deckId);
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
      <div>
        <p className="text-xs uppercase text-muted-foreground">Retention (30d)</p>
        <p className="text-2xl font-semibold">{data.retention === null ? "—" : `${data.retention}%`}</p>
      </div>
      <div>
        <p className="mb-1 text-xs uppercase text-muted-foreground">Due forecast (7d)</p>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.forecast}>
              <XAxis dataKey="dateKey" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
