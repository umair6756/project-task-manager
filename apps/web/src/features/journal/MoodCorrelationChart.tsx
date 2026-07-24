import { ComposedChart, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useMoodCorrelation } from "./useJournal";

export function MoodCorrelationChart() {
  const { data } = useMoodCorrelation(90);
  if (!data || data.points.length === 0) return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Correlation (mood vs. tasks completed): <span className="font-medium text-foreground">{data.correlation === null ? "—" : data.correlation.toFixed(2)}</span>
      </p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.points}>
            <XAxis dataKey="dateKey" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis yAxisId="mood" domain={[1, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis yAxisId="tasks" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
            <Bar yAxisId="tasks" dataKey="tasksCompleted" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} />
            <Line yAxisId="mood" type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
