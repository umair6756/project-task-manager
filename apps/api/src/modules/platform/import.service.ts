// WHAT: Re-creates an exported user-data JSON blob under a (possibly
// different) userId, remapping every old ObjectId to a freshly-created one
// so cross-references (task.projectId, keyResult.binding.refId, ...) still
// point at the right doc. WHY: import is for restoring a backup or moving
// data between accounts — ids must never collide with the target user's
// existing data.
//
// SCOPE NOTE: covers every collection export.service.ts exports. Task
// `dependsOn` is remapped in a second pass once every task has a new id
// (it's the only genuine same-collection self-reference). Notifications,
// routine-run sessions, and weekly-review answers are intentionally left
// out of import — they're operational history, not data worth restoring.
import mongoose from "mongoose";
import { Area } from "../areas/area.model.js";
import { Project } from "../projects/project.model.js";
import { Milestone } from "../projects/milestone.model.js";
import { Label } from "../labels/label.model.js";
import { Task } from "../tasks/task.model.js";
import { Notebook } from "../notes/notebook.model.js";
import { Note } from "../notes/note.model.js";
import { LearningItem } from "../learning/learningItem.model.js";
import { Skill } from "../learning/skill.model.js";
import { Certificate } from "../learning/certificate.model.js";
import { Deck } from "../learning/deck.model.js";
import { Card } from "../learning/card.model.js";
import { Habit } from "../habits/habit.model.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { Routine } from "../habits/routine.model.js";
import { Goal } from "../goals/goal.model.js";
import { KeyResult } from "../goals/keyResult.model.js";
import { CheckIn } from "../goals/checkIn.model.js";
import { TimeEntry } from "../time/timeEntry.model.js";
import { DailyPlan } from "../planning/dailyPlan.model.js";
import { JournalEntry } from "../planning/journalEntry.model.js";
import { SavedFilter } from "../savedFilters/savedFilter.model.js";
import type { ExportedData } from "./export.types.js";

type IdMap = Map<string, mongoose.Types.ObjectId>;

function remapId(idMap: IdMap, oldId: unknown): mongoose.Types.ObjectId | null {
  if (!oldId) return null;
  return idMap.get(String(oldId)) ?? null;
}
function remapIds(idMap: IdMap, oldIds: unknown[] | undefined): mongoose.Types.ObjectId[] {
  if (!oldIds) return [];
  return oldIds.map((id) => remapId(idMap, id)).filter((id): id is mongoose.Types.ObjectId => id !== null);
}

// Inserts `docs` under the new userId with fresh _ids, applying `remap` to
// each doc before insertion, and returns the old-id -> new-id map.
async function importCollection<T extends { _id: unknown }>(
  Model: mongoose.Model<unknown>,
  docs: T[],
  userId: string,
  remap: (doc: T, newId: mongoose.Types.ObjectId) => Record<string, unknown>,
): Promise<IdMap> {
  const idMap: IdMap = new Map();
  for (const doc of docs) {
    const newId = new mongoose.Types.ObjectId();
    idMap.set(String(doc._id), newId);
    await Model.create({ ...remap(doc, newId), _id: newId, userId });
  }
  return idMap;
}

export async function importUserData(userId: string, exported: ExportedData): Promise<{ imported: Record<string, number> }> {
  const d = exported.data;
  const imported: Record<string, number> = {};

  const areaIds = await importCollection(Area, d.areas ?? [], userId, (doc) => ({ ...doc, _id: undefined }));
  // Labels are unique per (userId, name) — re-importing into an account
  // that already has a label with the same name reuses that existing
  // label instead of erroring, since they're the same real-world tag.
  const labelIds: IdMap = new Map();
  for (const doc of d.labels ?? []) {
    const existing = await Label.findOne({ userId, name: doc.name as string });
    if (existing) {
      labelIds.set(String(doc._id), existing._id as mongoose.Types.ObjectId);
      continue;
    }
    const created = await Label.create({ ...doc, _id: undefined, userId });
    labelIds.set(String(doc._id), created._id as mongoose.Types.ObjectId);
  }

  const projectIds = await importCollection(Project, d.projects ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    areaId: remapId(areaIds, doc.areaId),
  }));

  const milestoneIds = await importCollection(Milestone, d.milestones ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    projectId: remapId(projectIds, doc.projectId),
  }));

  const taskIds = await importCollection(Task, d.tasks ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    projectId: remapId(projectIds, doc.projectId),
    milestoneId: remapId(milestoneIds, doc.milestoneId),
    labels: remapIds(labelIds, doc.labels as unknown[]),
    dependsOn: [], // patched in a second pass below
  }));

  // Second pass: now that every task has a new id, remap dependsOn.
  for (const doc of d.tasks ?? []) {
    const newId = taskIds.get(String(doc._id));
    if (!newId) continue;
    const dependsOn = remapIds(taskIds, doc.dependsOn as unknown[]);
    if (dependsOn.length > 0) await Task.updateOne({ _id: newId }, { $set: { dependsOn } });
  }

  // Notebooks can nest (parentId references another Notebook), so — same
  // trick as Task.dependsOn — create them all first, then patch parentId
  // once every notebook has a new id.
  const notebookIds = await importCollection(Notebook, d.notebooks ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    parentId: null,
  }));
  for (const doc of d.notebooks ?? []) {
    const newId = notebookIds.get(String(doc._id));
    const parentId = remapId(notebookIds, doc.parentId);
    if (newId && parentId) await Notebook.updateOne({ _id: newId }, { $set: { parentId } });
  }

  const noteIds = await importCollection(Note, d.notes ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    notebookId: remapId(notebookIds, doc.notebookId),
    linkedTaskIds: remapIds(taskIds, doc.linkedTaskIds as unknown[]),
    linkedProjectIds: remapIds(projectIds, doc.linkedProjectIds as unknown[]),
  }));

  const skillIds = await importCollection(Skill, d.skills ?? [], userId, (doc) => ({ ...doc, _id: undefined }));

  const learningItemIds = await importCollection(LearningItem, d.learningItems ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    skillIds: remapIds(skillIds, doc.skillIds as unknown[]),
    noteIds: remapIds(noteIds, doc.noteIds as unknown[]),
  }));

  await importCollection(Certificate, d.certificates ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    learningItemId: remapId(learningItemIds, doc.learningItemId),
  }));

  const deckIds = await importCollection(Deck, d.decks ?? [], userId, (doc) => ({ ...doc, _id: undefined }));
  const cardIds = await importCollection(Card, d.cards ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    deckId: remapId(deckIds, doc.deckId),
  }));

  const habitIds = await importCollection(Habit, d.habits ?? [], userId, (doc) => ({ ...doc, _id: undefined }));
  await importCollection(HabitLog, d.habitLogs ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    habitId: remapId(habitIds, doc.habitId),
  }));
  await importCollection(Routine, d.routines ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    habitIds: remapIds(habitIds, doc.habitIds as unknown[]),
  }));

  const goalIds = await importCollection(Goal, d.goals ?? [], userId, (doc) => ({ ...doc, _id: undefined }));
  const keyResultIds = await importCollection(KeyResult, d.keyResults ?? [], userId, (doc) => {
    const binding = doc.binding as { kind: string; refId: unknown; windowDays?: number } | null;
    let remappedBinding = binding;
    if (binding) {
      const refMap = binding.kind === "tasksCompletedInProject" ? projectIds : binding.kind === "habitCompletionRate" ? habitIds : learningItemIds;
      const refId = remapId(refMap, binding.refId);
      remappedBinding = refId ? { ...binding, refId } : null;
    }
    return { ...doc, _id: undefined, goalId: remapId(goalIds, doc.goalId), binding: remappedBinding };
  });
  await importCollection(CheckIn, d.checkIns ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    goalId: remapId(goalIds, doc.goalId),
    keyResultId: remapId(keyResultIds, doc.keyResultId),
  }));

  await importCollection(TimeEntry, d.timeEntries ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    taskId: remapId(taskIds, doc.taskId),
    learningItemId: remapId(learningItemIds, doc.learningItemId),
  }));

  await importCollection(DailyPlan, d.dailyPlans ?? [], userId, (doc) => ({
    ...doc,
    _id: undefined,
    mitTaskIds: remapIds(taskIds, doc.mitTaskIds as unknown[]),
  }));

  await importCollection(JournalEntry, d.journalEntries ?? [], userId, (doc) => ({ ...doc, _id: undefined }));

  await importCollection(SavedFilter, d.savedFilters ?? [], userId, (doc) => {
    const query = doc.query as Record<string, unknown>;
    return {
      ...doc,
      _id: undefined,
      query: {
        ...query,
        projectId: remapId(projectIds, query.projectId),
        labels: remapIds(labelIds, query.labels as unknown[]),
      },
    };
  });

  imported.areas = areaIds.size;
  imported.labels = labelIds.size;
  imported.projects = projectIds.size;
  imported.milestones = milestoneIds.size;
  imported.tasks = taskIds.size;
  imported.notebooks = notebookIds.size;
  imported.notes = noteIds.size;
  imported.skills = skillIds.size;
  imported.learningItems = learningItemIds.size;
  imported.decks = deckIds.size;
  imported.cards = cardIds.size;
  imported.habits = habitIds.size;
  imported.goals = goalIds.size;
  imported.keyResults = keyResultIds.size;

  return { imported };
}
