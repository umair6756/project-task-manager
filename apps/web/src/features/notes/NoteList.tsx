import { useState } from "react";
import { CalendarDays, FileStack, Plus, Search, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { useCreateNote, useDailyNote, useNotes, useSearchNotes } from "./useNotes";
import { TemplatesPicker } from "./TemplatesPicker";

interface Props {
  notebookId: string | null | "all";
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ notebookId, selectedNoteId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const notesQuery = useNotes(notebookId === "all" || notebookId === null ? {} : { notebookId });
  const searchQuery = useSearchNotes(query);
  const create = useCreateNote();
  const dailyNote = useDailyNote();

  const searching = query.trim().length > 0;
  const notes = searching ? (searchQuery.data?.notes ?? []) : (notesQuery.data?.notes ?? []);

  async function newNote() {
    const note = await create.mutateAsync({
      title: "Untitled",
      content: "",
      notebookId: notebookId === "all" ? null : notebookId,
    });
    onSelect(note.note.id);
  }

  async function openDaily() {
    const res = await dailyNote.mutateAsync();
    onSelect(res.note.id);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col border-r border-border">
      <div className="space-y-2 border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes..." className="h-8 pl-7 text-sm" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => void newNote()} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-1 text-xs hover:bg-accent">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <button onClick={() => void openDaily()} title="Today's daily note" className="rounded-md border border-border p-1.5 hover:bg-accent">
            <CalendarDays className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowTemplates(true)} title="New from template" className="rounded-md border border-border p-1.5 hover:bg-accent">
            <FileStack className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 && <p className="p-3 text-xs text-muted-foreground">No notes.</p>}
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelect(note.id)}
            className={cn("flex w-full flex-col gap-0.5 border-b border-border/50 px-3 py-2 text-left hover:bg-accent/50", selectedNoteId === note.id && "bg-accent")}
          >
            <span className="flex items-center gap-1.5 truncate text-sm font-medium">
              {note.favorited && <Star className="h-3 w-3 shrink-0 fill-current text-yellow-400" />}
              {note.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">{"snippet" in note ? note.snippet : note.content.slice(0, 80)}</span>
          </button>
        ))}
      </div>

      {showTemplates && (
        <TemplatesPicker
          notebookId={notebookId === "all" ? null : notebookId}
          onClose={() => setShowTemplates(false)}
          onCreated={(id) => {
            onSelect(id);
            setShowTemplates(false);
          }}
        />
      )}
    </div>
  );
}
