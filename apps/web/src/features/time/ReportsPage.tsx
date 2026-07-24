import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAreaBudgets, useDeepWorkHeat, useTimeByArea, useTimeByProject } from "./useReports";

function useLast30Days() {
  return useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to };
  }, []);
}

function MinutesBarChart({ data, labelKey }: { data: { minutes: number; [k: string]: unknown }[]; labelKey: string }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No time tracked in this range.</p>;
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={labelKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.slice(0, 6)} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
          <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportsPage() {
  const { from, to } = useLast30Days();
  const byProject = useTimeByProject(from, to);
  const byArea = useTimeByArea(from, to);
  const deepWork = useDeepWorkHeat(from, to);
  const budgets = useAreaBudgets();

  const hourData = (deepWork.data?.byHour ?? []).map((minutes, hour) => ({ hour: `${hour}:00`, minutes }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Time by project (30d)</h2>
        <MinutesBarChart data={(byProject.data?.byProject ?? []).map((r) => ({ ...r, projectId: r.projectId ?? "none" }))} labelKey="projectId" />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Time by area (30d)</h2>
        <MinutesBarChart data={(byArea.data?.byArea ?? []).map((r) => ({ ...r, areaId: r.areaId ?? "none" }))} labelKey="areaId" />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Deep-work heat by hour (30d)</h2>
        <MinutesBarChart data={hourData} labelKey="hour" />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Weekly area budgets</h2>
        <div className="space-y-2">
          {(budgets.data?.budgets ?? []).map((b) => (
            <div key={b.areaId} className="rounded-md border border-border p-2.5">
              <div className="mb-1 flex justify-between text-sm">
                <span>{b.areaId}</span>
                <span className="text-muted-foreground">
                  {b.consumedHours}h / {b.budgetHours}h
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, b.consumedPercent)}%` }} />
              </div>
            </div>
          ))}
          {(budgets.data?.budgets ?? []).length === 0 && <p className="text-sm text-muted-foreground">No area budgets configured (Settings, Phase 14).</p>}
        </div>
      </div>
    </div>
  );
}
