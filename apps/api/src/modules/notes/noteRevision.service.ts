import { NoteRevision } from "./noteRevision.model.js";
import type { NoteDoc } from "./note.model.js";

const MAX_REVISIONS = 20;

// Snapshot the note's current state, then trim anything past the last 20
// (oldest first) for this note.
export async function recordRevision(note: NoteDoc): Promise<void> {
  await NoteRevision.create({
    userId: note.userId,
    noteId: note._id,
    title: note.title,
    content: note.content,
    createdAt: new Date(),
  });

  const toKeep = await NoteRevision.find({ noteId: note._id })
    .sort({ createdAt: -1 })
    .skip(MAX_REVISIONS)
    .select("_id");
  if (toKeep.length > 0) {
    await NoteRevision.deleteMany({ _id: { $in: toKeep.map((r) => r._id) } });
  }
}
