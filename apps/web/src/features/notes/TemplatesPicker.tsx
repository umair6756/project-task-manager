import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateFromTemplate, useNoteTemplates } from "./useNotes";

export function TemplatesPicker({ notebookId, onClose, onCreated }: { notebookId: string | null; onClose: () => void; onCreated: (id: string) => void }) {
  const { data } = useNoteTemplates();
  const createFrom = useCreateFromTemplate();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const templates = data?.templates ?? [];

  async function create() {
    if (!templateId || !title.trim()) return;
    const res = await createFrom.mutateAsync({ templateId, title: title.trim(), notebookId });
    onCreated(res.note.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold">New note from template</h2>
        {templates.length === 0 && <p className="text-xs text-muted-foreground">No templates yet — save any note as a template from its menu.</p>}
        <ul className="max-h-40 space-y-1 overflow-y-auto">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setTemplateId(t.id)}
                className={`w-full rounded-md border px-2 py-1.5 text-left text-sm ${templateId === t.id ? "border-primary bg-accent" : "border-border"}`}
              >
                {t.title}
              </button>
            </li>
          ))}
        </ul>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New note title" />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void create()} disabled={!templateId || !title.trim() || createFrom.isPending}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
