import { useEffect, useState } from "react";
import { marked } from "marked";
import { Eye, EyeOff, History, Star, Trash2, Download, FileStack, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useDeleteNote, useNote, useSaveAsTemplate, useUpdateNote } from "./useNotes";
import { BacklinksPanel } from "./BacklinksPanel";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";
import { WikiLinkInserter } from "./WikiLinkInserter";

export function NoteEditor({ noteId, onOpenNote }: { noteId: string; onOpenNote: (id: string) => void }) {
  const { data } = useNote(noteId);
  const update = useUpdateNote();
  const del = useDeleteNote();
  const saveTemplate = useSaveAsTemplate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const note = data?.note;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note?.id, note?.title, note?.content]);

  function commitTitle() {
    if (note && title.trim() && title !== note.title) update.mutate({ id: noteId, patch: { title: title.trim() } });
  }

  function commitContent(next: string) {
    setContent(next);
  }

  function saveContent() {
    if (note && content !== note.content) update.mutate({ id: noteId, patch: { content } });
  }

  if (!note) return <div className="flex-1 p-6 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <WikiLinkInserter onInsert={(text) => setContent((c) => `${c}${c.endsWith("\n") || !c ? "" : "\n"}${text}`)} />
        <Button variant="ghost" size="icon" onClick={() => setPreview((v) => !v)} title={preview ? "Edit" : "Preview"}>
          {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => update.mutate({ id: noteId, patch: { pinned: !note.pinned } })}
          className={cn(note.pinned && "text-primary")}
          title="Pin"
        >
          <Pin className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => update.mutate({ id: noteId, patch: { favorited: !note.favorited } })}
          className={cn(note.favorited && "text-yellow-400")}
          title="Favorite"
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} title="Version history">
          <History className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => saveTemplate.mutate(noteId)} title="Save as template">
          <FileStack className="h-4 w-4" />
        </Button>
        <a href={`/api/notes/${noteId}/export`} target="_blank" rel="noreferrer" className="rounded-md p-1.5 hover:bg-accent" title="Export .md">
          <Download className="h-4 w-4" />
        </a>
        <Button variant="ghost" size="icon" className="ml-auto text-destructive" onClick={() => del.mutate(noteId)} title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        className="border-none px-4 py-3 text-xl font-semibold shadow-none focus-visible:ring-0"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {preview ? (
          // Single-user personal app (CLAUDE.md §1) — rendering the user's own
          // markdown unsanitized is an accepted risk here; revisit with DOMPurify
          // before this is ever multi-tenant.
          <div className="note-preview text-sm" dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }} />
        ) : (
          // Plain textarea rather than CodeMirror 6 (CLAUDE.md's stated
          // choice) — @uiw/react-codemirror's registry metadata was
          // unreachable via pnpm in this sandbox across 5 retried installs
          // (curl to the same URL succeeded every time), so this substitutes
          // syntax highlighting for a working editor rather than blocking
          // the whole notes feature on one package.
          <textarea
            value={content}
            onChange={(e) => commitContent(e.target.value)}
            onBlur={saveContent}
            className="h-full w-full resize-none bg-transparent font-mono text-sm outline-none"
            spellCheck={false}
          />
        )}
      </div>

      <BacklinksPanel noteId={noteId} onOpen={onOpenNote} />

      {showHistory && <VersionHistoryDrawer noteId={noteId} onClose={() => setShowHistory(false)} />}
    </div>
  );
}
