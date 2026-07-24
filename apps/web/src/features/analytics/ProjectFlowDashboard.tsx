import { useState } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useProjects } from "@/features/projects/useProjects";
import { useProjectBurndown, useProjectCfd } from "./useAnalytics";

export function ProjectFlowDashboard() {
  const { data: projectsData } = useProjects();
  const [projectId, setProjectId] = useState<string | null>(null);
  const burndown = useProjectBurndown(projectId);
  const cfd = useProjectCfd(projectId);

  const projects = projectsData?.projects ?? [];

  return (
    <div className="space-y-4">
      <select value={projectId ?? ""} onChange={(e) => setProjectId(e.target.value || null)} className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm">
        <option value="">Select a project...</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {!projectId && <p className="text-sm text-muted-foreground">Pick a project to see its burndown and cumulative flow.</p>}

      {projectId && (
        <>
          <div>
            <h3 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Burndown (open tasks remaining)</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndown.data?.burndown ?? []}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Line type="monotone" dataKey="remaining" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Cumulative flow (open vs done)</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cfd.data?.cfd ?? []}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="done" stackId="1" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.4)" />
                  <Area type="monotone" dataKey="open" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.4)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
