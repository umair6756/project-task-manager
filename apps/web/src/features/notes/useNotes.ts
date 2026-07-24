import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateNoteInput, UpdateNoteInput } from "@flowforge/shared";
import { api } from "@/lib/apiClient";
import type { Backlink, GraphData, Note, NoteRevision } from "./types";

const key = ["notes"] as const;

export function useNotes(params: { notebookId?: string; favorited?: boolean; pinned?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.notebookId) qs.set("notebookId", params.notebookId);
  if (params.favorited) qs.set("favorited", "true");
  if (params.pinned) qs.set("pinned", "true");
  const s = qs.toString();
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => api.get<{ notes: Note[] }>(`/notes${s ? `?${s}` : ""}`),
  });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: [...key, id],
    queryFn: () => api.get<{ note: Note }>(`/notes/${id}`),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => api.post<{ note: Note }>("/notes", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateNoteInput }) => api.patch<{ note: Note }>(`/notes/${id}`, patch),
    onSuccess: (_res, { id }) => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, id] });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/notes/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useSearchNotes(q: string) {
  return useQuery({
    queryKey: [...key, "search", q],
    queryFn: () => api.get<{ notes: (Note & { snippet: string })[] }>(`/notes/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length > 0,
  });
}

export function useDailyNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.get<{ note: Note }>("/notes/daily"),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useBacklinks(noteId: string | null) {
  return useQuery({
    queryKey: [...key, noteId, "backlinks"],
    queryFn: () => api.get<{ backlinks: Backlink[] }>(`/notes/${noteId}/backlinks`),
    enabled: !!noteId,
  });
}

export function useNoteGraph() {
  return useQuery({ queryKey: [...key, "graph"], queryFn: () => api.get<GraphData>("/notes/graph") });
}

export function useNoteTemplates() {
  return useQuery({ queryKey: [...key, "templates"], queryFn: () => api.get<{ templates: Note[] }>("/notes/templates") });
}

export function useSaveAsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.post<{ template: Note }>(`/notes/${noteId}/save-template`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...key, "templates"] }),
  });
}

export function useCreateFromTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, title, notebookId }: { templateId: string; title: string; notebookId?: string | null }) =>
      api.post<{ note: Note }>(`/notes/${templateId}/create-from-template`, { title, notebookId }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useNoteRevisions(noteId: string | null) {
  return useQuery({
    queryKey: [...key, noteId, "revisions"],
    queryFn: () => api.get<{ revisions: NoteRevision[] }>(`/notes/${noteId}/revisions`),
    enabled: !!noteId,
  });
}

export function useRestoreRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, revisionId }: { noteId: string; revisionId: string }) => api.post<{ note: Note }>(`/notes/${noteId}/revisions/${revisionId}/restore`),
    onSuccess: (_res, { noteId }) => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [...key, noteId] });
    },
  });
}
