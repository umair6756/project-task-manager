import { Button } from "@/components/ui/button";

interface Props {
  dependencies: { id: string; title: string }[];
  onCancel: () => void;
  onOverride: () => void;
}

export function DependencyWarningDialog({ dependencies, onCancel, onOverride }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2 text-sm font-semibold">Blocked by unfinished tasks</h2>
        <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
          {dependencies.map((d) => (
            <li key={d.id}>&bull; {d.title}</li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onOverride}>
            Complete anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
