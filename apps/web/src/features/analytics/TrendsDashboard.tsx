import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useTrends } from "./useAnalytics";

export function TrendsDashboard() {
  const { data } = useTrends(30);
  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const hourData = data.bestHours.map((count, hour) => ({ hour: `${hour}:00`, count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Completion rate</p>
          <p className="text-xl font-semibold">{data.completionRate}%</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Overdue ratio</p>
          <p className="text-xl font-semibold">{data.overdueRatio}%</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Best day</p>
          <p className="text-sm font-medium">{data.records.mostTasksCompletedInADay?.count ?? "—"} tasks</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Longest habit streak</p>
          <p className="text-sm font-medium">{data.records.longestHabitStreak?.streak ?? "—"}d</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Velocity (30d)</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.velocity}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Best hours to complete tasks</h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData}>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.procrastination.byProject.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Procrastination (avg. postpones by project)</h3>
          <ul className="space-y-1 text-sm">
            {data.procrastination.byProject.slice(0, 5).map((p, i) => (
              <li key={i} className="flex justify-between rounded-md border border-border px-2.5 py-1.5">
                <span>{p.projectId ?? "No project"}</span>
                <span className="text-muted-foreground">{p.avgPostpones} avg ({p.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
