// WHAT: Hourly job body — finds every "fixed" mode recurring template task
// and materializes any occurrences due within the next 14 days. Delegates
// the actual idempotent creation logic to recurrence.service.
import { Task } from "../modules/tasks/task.model.js";
import { materializeFixedOccurrences } from "../modules/tasks/recurrence.service.js";

export async function runFixedRecurrenceSpawner(): Promise<number> {
  const templates = await Task.find({ "recurrence.mode": "fixed" });
  let totalCreated = 0;
  for (const template of templates) {
    totalCreated += await materializeFixedOccurrences(template);
  }
  return totalCreated;
}
