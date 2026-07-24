export type LearningItemType = "course" | "book" | "video" | "article" | "tutorial";
export type LearningItemStatus = "wishlist" | "learning" | "completed" | "abandoned";
export type ProgressUnit = "percent" | "pages" | "lectures" | "hours";

export interface ProgressEntry {
  value: number;
  note: string;
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
}

export interface LearningItem {
  id: string;
  type: LearningItemType;
  title: string;
  source?: string;
  url?: string;
  status: LearningItemStatus;
  progressUnit: ProgressUnit;
  progressCurrent: number;
  progressTarget: number;
  progressHistory: ProgressEntry[];
  sections: Section[];
  skillIds: string[];
  takeaways: string;
  noteIds: string[];
  completedAt: string | null;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category?: string;
}

export interface Certificate {
  id: string;
  learningItemId?: string | null;
  title: string;
  issuer?: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
  fileUrl?: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  dueCount: number;
}

export type SrsState = "new" | "learning" | "review";

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  srs: {
    ease: number;
    intervalDays: number;
    dueAt: string;
    reps: number;
    lapses: number;
    state: SrsState;
  };
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";
