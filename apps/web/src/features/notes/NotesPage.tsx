import { useState } from "react";
import { Network } from "lucide-react";
import { NotebookTree } from "./NotebookTree";
import { NoteList } from "./NoteList";
import { NoteEditor } from "./NoteEditor";
import { NoteGraphView } from "./NoteGraphView";

export function NotesPage() {
  const [notebookId, setNotebookId] = useState<string | null | "all">("all");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)]">
      <NotebookTree selectedId={notebookId} onSelect={setNotebookId} />
      <NoteList notebookId={notebookId} selectedNoteId={noteId} onSelect={setNoteId} />

      <div className="relative flex flex-1 flex-col">
        <button
          onClick={() => setShowGraph((v) => !v)}
          className="absolute right-3 top-2 z-10 rounded-md border border-border bg-card p-1.5 hover:bg-accent"
          title="Graph view"
        >
          <Network className="h-4 w-4" />
        </button>

        {showGraph ? (
          <NoteGraphView
            onOpen={(id) => {
              setNoteId(id);
              setShowGraph(false);
            }}
          />
        ) : noteId ? (
          <NoteEditor noteId={noteId} onOpenNote={setNoteId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select or create a note.</div>
        )}
      </div>
    </div>
  );
}
