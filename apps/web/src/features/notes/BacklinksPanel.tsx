import { useBacklinks } from "./useNotes";

export function BacklinksPanel({ noteId, onOpen }: { noteId: string; onOpen: (id: string) => void }) {
  const { data } = useBacklinks(noteId);
  const backlinks = data?.backlinks ?? [];

  if (backlinks.length === 0) return null;

  return (
    <div className="border-t border-border p-3">
      <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">Linked from</p>
      <ul className="space-y-1">
        {backlinks.map((b, i) => {
          const source = typeof b.sourceNoteId === "string" ? { id: b.sourceNoteId, title: b.sourceNoteId } : b.sourceNoteId;
          return (
            <li key={source.id ?? i}>
              <button onClick={() => onOpen(source.id)} className="text-sm text-primary hover:underline">
                {source.title}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
