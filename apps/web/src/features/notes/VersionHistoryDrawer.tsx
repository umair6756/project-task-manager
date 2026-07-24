import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteRevisions, useRestoreRevision } from "./useNotes";

export function VersionHistoryDrawer({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const { data } = useNoteRevisions(noteId);
  const restore = useRestoreRevision();
  const revisions = data?.revisions ?? [];

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-medium uppercase text-muted-foreground">Version history</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {revisions.length === 0 && <p className="text-xs text-muted-foreground">No prior revisions.</p>}
        {revisions.map((rev) => (
          <div key={rev.id} className="rounded-md border border-border p-2.5 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{format(new Date(rev.createdAt), "MMM d, HH:mm")}</span>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => restore.mutate({ noteId, revisionId: rev.id })}
                disabled={restore.isPending}
              >
                Restore
              </Button>
            </div>
            <p className="truncate text-muted-foreground">{rev.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
