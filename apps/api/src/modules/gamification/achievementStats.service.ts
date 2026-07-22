// WHAT: Computes the current value of each achievement statKey on demand
// (countDocuments/max queries — no running counters to keep in sync).
// Fine at personal-app data volumes; revisit with cached counters if this
// ever needs to scale to many users.
import { Task } from "../tasks/task.model.js";
import { Habit } from "../habits/habit.model.js";
import { HabitLog } from "../habits/habitLog.model.js";
import { CardReview } from "../learning/cardReview.model.js";
import { Note } from "../notes/note.model.js";
import { LearningItem } from "../learning/learningItem.model.js";
import { PomodoroSession } from "../time/pomodoroSession.model.js";
import { Goal } from "../goals/goal.model.js";
import { TimeEntry } from "../time/timeEntry.model.js";
import { JournalEntry } from "../planning/journalEntry.model.js";
import { Project } from "../projects/project.model.js";
import { Skill } from "../learning/skill.model.js";
import { Certificate } from "../learning/certificate.model.js";

export async function computeStat(userId: string, statKey: string): Promise<number> {
  switch (statKey) {
    case "tasksCompleted":
      return Task.countDocuments({ userId, status: "done" });
    case "habitStreak": {
      const [best] = await Habit.find({ userId }).sort({ bestStreak: -1 }).limit(1);
      return best?.bestStreak ?? 0;
    }
    case "cardsReviewed":
      return CardReview.countDocuments({ userId });
    case "notesCreated":
      return Note.countDocuments({ userId, isTemplate: false });
    case "learningItemsCompleted":
      return LearningItem.countDocuments({ userId, status: "completed" });
    case "pomodorosCompleted":
      return PomodoroSession.countDocuments({ userId, completedAt: { $ne: null } });
    case "goalsCompleted":
      return Goal.countDocuments({ userId, status: "archived" });
    case "focusMinutesTotal": {
      const entries = await TimeEntry.find({ userId, end: { $ne: null } }).select("start end").lean();
      const minutes = entries.reduce((sum, e) => sum + (e.end!.getTime() - e.start.getTime()) / 60000, 0);
      return Math.round(minutes);
    }
    case "journalEntries":
      return JournalEntry.countDocuments({ userId });
    case "habitCheckins":
      return HabitLog.countDocuments({ userId, status: "done" });
    case "projectsCompleted":
      return Project.countDocuments({ userId, status: "done" });
    case "skillsAtLevel5":
      return Skill.countDocuments({ userId, level: 5 });
    case "certificatesEarned":
      return Certificate.countDocuments({ userId });
    default:
      return 0;
  }
}
