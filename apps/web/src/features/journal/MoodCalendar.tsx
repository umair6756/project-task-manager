import { useJournalEntries } from "./useJournal";

const MOOD_COLOR: Record<number, string> = {
  1: "hsl(0 72% 51% / 0.8)",
  2: "hsl(25 72% 51% / 0.8)",
  3: "hsl(45 72% 51% / 0.8)",
  4: "hsl(100 60% 45% / 0.8)",
  5: "hsl(142 71% 45% / 0.8)",
};

export function MoodCalendar() {
  const { data } = useJournalEntries();
  const entries = data?.entries ?? [];
  const byDate = new Map(entries.map((e) => [e.dateKey, e.mood]));

  const days: string[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((d) => {
        const mood = byDate.get(d);
        return (
          <div
            key={d}
            title={mood ? `${d}: mood ${mood}` : d}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: mood ? MOOD_COLOR[mood] : "hsl(var(--secondary))" }}
          />
        );
      })}
    </div>
  );
}
