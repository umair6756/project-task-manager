// WHAT: One-way note -> task creation, with completion syncing both ways
// (proposal #82). Convention (documented since this is a bespoke format):
//   "- [ ] Buy milk #task"              -> a checkbox NOT yet linked to a
//                                          real task; the trailing "#task"
//                                          flags it for sync.
//   "- [ ] Buy milk #task <!--task:ID-->" -> already linked to Task `ID`.
// On note SAVE: every flagged line's checked state is pushed onto its
// linked task (creating the task the first time, appending the `<!--task:
// ID-->` marker into the stored content so re-parsing finds the same link
// instead of creating a duplicate).
// On note READ: linked tasks' current status is pulled back into the
// checkbox state (so completing the task elsewhere — e.g. the Tasks UI —
// shows up as checked next time the note is viewed), without needing a
// write. This is why the sync is "two functions", not one.
import { Task } from "../tasks/task.model.js";

// Groups: 1=leading "- [", 2=check char, 3=title text up to "#task" (lazy,
// so it never swallows the trailing marker comment), 4=linked task id.
const CHECKBOX_LINE = /^(\s*-\s\[)([ xX])\]\s+(.*?)#task(?:\s*<!--task:([0-9a-fA-F]{24})-->)?\s*$/;

export interface SyncResult {
  content: string;
  tasksCreated: number;
  tasksUpdated: number;
}

// Called before saving a note: creates a Task for every newly flagged
// checkbox line, updates existing linked tasks' done state from the
// checkbox, and injects `<!--task:ID-->` markers for new links.
export async function pushCheckboxesToTasks(
  userId: string,
  noteId: string,
  content: string,
): Promise<SyncResult> {
  const lines = content.split("\n");
  let tasksCreated = 0;
  let tasksUpdated = 0;
  const linkedTaskIds: string[] = [];

  const newLines = await Promise.all(
    lines.map(async (line) => {
      const match = line.match(CHECKBOX_LINE);
      if (!match) return line;

      const checked = match[2]!.toLowerCase() === "x";
      const existingId = match[4];
      const title = match[3]!.trim();

      if (existingId) {
        await Task.updateOne(
          { _id: existingId, userId },
          { $set: { status: checked ? "done" : "todo", completedAt: checked ? new Date() : null } },
        );
        linkedTaskIds.push(existingId);
        tasksUpdated++;
        return line;
      }

      const task = await Task.create({
        userId,
        title,
        status: checked ? "done" : "todo",
        completedAt: checked ? new Date() : null,
        activity: [{ action: "created", detail: { via: "note-checkbox", noteId } }],
      });
      linkedTaskIds.push(String(task._id));
      tasksCreated++;
      return `${match[1]}${match[2]}] ${title} #task <!--task:${task._id}-->`;
    }),
  );

  if (linkedTaskIds.length > 0) {
    const { Note } = await import("./note.model.js");
    await Note.updateOne({ _id: noteId }, { $addToSet: { linkedTaskIds: { $each: linkedTaskIds } } });
  }

  return { content: newLines.join("\n"), tasksCreated, tasksUpdated };
}

// Called on note read: overlays each linked task's *current* status onto
// the rendered checkbox state, without persisting — so the note reflects
// tasks completed elsewhere without needing every task completion to write
// back into every note that references it.
export async function renderCheckboxesFromTaskStatus(userId: string, content: string): Promise<string> {
  const ids = [...content.matchAll(/<!--task:([0-9a-fA-F]{24})-->/g)].map((m) => m[1]!);
  if (ids.length === 0) return content;

  const tasks = await Task.find({ _id: { $in: ids }, userId }).select("status").lean();
  const doneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => String(t._id)));

  return content
    .split("\n")
    .map((line) => {
      const match = line.match(CHECKBOX_LINE);
      if (!match || !match[4]) return line;
      const shouldBeChecked = doneIds.has(match[4]);
      const currentChar = shouldBeChecked ? "x" : " ";
      return `${match[1]}${currentChar}] ${match[3]}#task <!--task:${match[4]}-->`;
    })
    .join("\n");
}
