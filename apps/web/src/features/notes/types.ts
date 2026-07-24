export interface Notebook {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
}

export interface Note {
  id: string;
  notebookId: string | null;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  favorited: boolean;
  isTemplate: boolean;
  dailyDate: string | null;
  linkedTaskIds: string[];
  linkedProjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteRevision {
  id: string;
  noteId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Backlink {
  sourceNoteId: { id: string; title: string } | string;
}

export interface GraphData {
  nodes: { id: string; title: string }[];
  edges: { source: string; target: string }[];
}
