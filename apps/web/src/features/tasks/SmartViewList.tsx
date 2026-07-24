import { useState } from "react";
import { VirtualTaskList } from "./VirtualTaskList";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { DependencyWarningDialog } from "./DependencyWarningDialog";
import { useCompleteTask, useUpdateTask } from "./useTasks";
import type { Task } from "./types";

// Shared read-mostly list renderer for the smart views (Today/Upcoming/
// Inbox/Anytime) — these are server-computed sets, not something the user
// reorders, so no drag-and-drop here (unlike the main TaskListView).
export function SmartViewList({ sections }: { sections: { label: string; tasks: Task[] }[] }) {
  const complete = useCompleteTask();
  const update = useUpdateTask();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [blockedDialog, setBlockedDialog] = useState<{ taskId: string; deps: { id: string; title: string }[] } | null>(null);

  const allTasks = sections.flatMap((s) => s.tasks);
  const openTask = allTasks.find((t) => t.id === openTaskId) ?? null;

  async function handleComplete(task: Task) {
    if (task.status === "done") {
      update.mutate({ id: task.id, patch: { status: "todo" } });
      return;
    }
    const res = await complete.mutateAsync({ id: task.id });
    if (res.warning === "BLOCKED_BY_INCOMPLETE_DEPENDENCIES" && res.unfinishedDependencies) {
      setBlockedDialog({ taskId: task.id, deps: res.unfinishedDependencies });
    }
  }

  const nonEmpty = sections.filter((s) => s.tasks.length > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {nonEmpty.length === 0 && <p className="text-sm text-muted-foreground">Nothing here.</p>}
      {nonEmpty.map((section) => (
        <div key={section.label}>
          <h3 className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">
            {section.label} ({section.tasks.length})
          </h3>
          <div className="rounded-lg border border-border">
            <VirtualTaskList tasks={section.tasks} onComplete={(task) => void handleComplete(task)} onOpen={(id) => setOpenTaskId(id)} />
          </div>
        </div>
      ))}

      {openTask && <TaskDetailPanel task={openTask} onClose={() => setOpenTaskId(null)} />}

      {blockedDialog && (
        <DependencyWarningDialog
          dependencies={blockedDialog.deps}
          onCancel={() => setBlockedDialog(null)}
          onOverride={() => {
            complete.mutate({ id: blockedDialog.taskId, override: true });
            setBlockedDialog(null);
          }}
        />
      )}
    </div>
  );
}
