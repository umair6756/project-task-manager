// WHAT: Extracts [[wiki-links]] from markdown and keeps the NoteLink
// collection in sync with them. Pure parsing is separated from the DB sync
// so the regex logic is independently testable.
import { Note } from "./note.model.js";
import { NoteLink } from "./noteLink.model.js";

export function extractWikiLinkTitles(content: string): string[] {
  const matches = [...content.matchAll(/\[\[([^\]]+)\]\]/g)];
  const titles = matches.map((m) => m[1]!.trim()).filter((t) => t.length > 0);
  return [...new Set(titles)];
}

// Re-derives every outgoing link for `noteId` from its current content:
// delete the old rows, resolve each [[title]] against the user's notes by
// exact (case-insensitive) title match, insert fresh rows.
export async function syncNoteLinks(userId: string, noteId: string, content: string): Promise<void> {
  await NoteLink.deleteMany({ sourceNoteId: noteId });

  const titles = extractWikiLinkTitles(content);
  if (titles.length === 0) return;

  const candidates = await Note.find({ userId, title: { $in: titles.map((t) => new RegExp(`^${t}$`, "i")) } })
    .select("title")
    .lean();
  const byLowerTitle = new Map(candidates.map((c) => [(c.title as string).toLowerCase(), c._id]));

  await NoteLink.insertMany(
    titles.map((title) => ({
      userId,
      sourceNoteId: noteId,
      targetNoteId: byLowerTitle.get(title.toLowerCase()) ?? null,
      rawTitle: title,
    })),
  );
}

export async function getBacklinks(noteId: string) {
  return NoteLink.find({ targetNoteId: noteId }).populate("sourceNoteId", "title");
}

export async function getNoteGraph(userId: string) {
  const notes = await Note.find({ userId }).select("title").lean();
  const links = await NoteLink.find({ userId, targetNoteId: { $ne: null } }).lean();
  return {
    nodes: notes.map((n) => ({ id: String(n._id), title: n.title as string })),
    edges: links.map((l) => ({ source: String(l.sourceNoteId), target: String(l.targetNoteId) })),
  };
}
