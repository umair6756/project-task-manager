// WHAT: Full JSON export of every collection a user owns (proposal #11).
// WHY: single source powers both the "download my data" endpoint and the
// import test suite — export/import are always tested as a round trip.
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

// Collections in the shape { collectionKey: [...docs] }. Kept as a plain
// object (not an array of {model,docs}) so it round-trips through JSON
// exactly as the import side expects.
export async function exportUserData(userId: string) {
  const [
    areas,
    projects,
    milestones,
    labels,
    tasks,
    notebooks,
    notes,
    learningItems,
    skills,
    certificates,
    decks,
    cards,
    habits,
    habitLogs,
    routines,
    goals,
    keyResults,
    checkIns,
    timeEntries,
    dailyPlans,
    journalEntries,
    savedFilters,
  ] = await Promise.all([
    Area.find({ userId }).lean(),
    Project.find({ userId }).lean(),
    Milestone.find({ userId }).lean(),
    Label.find({ userId }).lean(),
    Task.find({ userId }).lean(),
    Notebook.find({ userId }).lean(),
    Note.find({ userId }).lean(),
    LearningItem.find({ userId }).lean(),
    Skill.find({ userId }).lean(),
    Certificate.find({ userId }).lean(),
    Deck.find({ userId }).lean(),
    Card.find({ userId }).lean(),
    Habit.find({ userId }).lean(),
    HabitLog.find({ userId }).lean(),
    Routine.find({ userId }).lean(),
    Goal.find({ userId }).lean(),
    KeyResult.find({ userId }).lean(),
    CheckIn.find({ userId }).lean(),
    TimeEntry.find({ userId }).lean(),
    DailyPlan.find({ userId }).lean(),
    JournalEntry.find({ userId }).lean(),
    SavedFilter.find({ userId }).lean(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {
      areas,
      projects,
      milestones,
      labels,
      tasks,
      notebooks,
      notes,
      learningItems,
      skills,
      certificates,
      decks,
      cards,
      habits,
      habitLogs,
      routines,
      goals,
      keyResults,
      checkIns,
      timeEntries,
      dailyPlans,
      journalEntries,
      savedFilters,
    },
  };
}
