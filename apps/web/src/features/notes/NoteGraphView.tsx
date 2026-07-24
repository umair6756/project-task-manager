import { useMemo } from "react";
import { useNoteGraph } from "./useNotes";

// Simple circular layout (no force-directed physics) — enough to visualize
// the wiki-link graph and click through to a note without pulling in a
// dedicated graph-layout library for one page.
export function NoteGraphView({ onOpen }: { onOpen: (id: string) => void }) {
  const { data } = useNoteGraph();
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  const positions = useMemo(() => {
    const radius = 220;
    const cx = 280;
    const cy = 220;
    const map = new Map<string, { x: number; y: number }>();
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
      map.set(n.id, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
    });
    return map;
  }, [nodes]);

  if (nodes.length === 0) return <p className="p-6 text-sm text-muted-foreground">No notes yet.</p>;

  return (
    <svg viewBox="0 0 560 440" className="h-full w-full">
      {edges.map((e, i) => {
        const a = positions.get(e.source);
        const b = positions.get(e.target);
        if (!a || !b) return null;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="hsl(var(--border))" strokeWidth={1} />;
      })}
      {nodes.map((n) => {
        const p = positions.get(n.id);
        if (!p) return null;
        return (
          <g key={n.id} transform={`translate(${p.x},${p.y})`} className="cursor-pointer" onClick={() => onOpen(n.id)}>
            <circle r={6} className="fill-primary" />
            <text x={10} y={4} className="fill-current text-[11px]" style={{ fill: "hsl(var(--foreground))" }}>
              {n.title.length > 24 ? `${n.title.slice(0, 24)}...` : n.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
