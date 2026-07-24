import { MoodEntry } from "./MoodEntry";
import { MoodCalendar } from "./MoodCalendar";
import { MoodCorrelationChart } from "./MoodCorrelationChart";

export function JournalPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <MoodEntry />

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Mood calendar</h2>
        <MoodCalendar />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-muted-foreground">Mood vs. productivity</h2>
        <MoodCorrelationChart />
      </div>
    </div>
  );
}
