import { useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { QuickAddBar } from "./QuickAddBar";
import { SortableTaskRow } from "./SortableTaskRow";
import { TaskRow } from "./TaskRow";
import { VirtualTaskList } from "./VirtualTaskList";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { DependencyWarningDialog } from "./DependencyWarningDialog";
import { BatchActionBar } from "./BatchActionBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompleteTask, useReorderTasks, useTasks, useUpdateTask } from "./useTasks";
import type { Task, TaskStatus } from "./types";

const OPEN_GROUPS: { status: TaskStatus; label: string }[] = [
  { status: "in-progress", label: "In progress" },
  { status: "blocked", label: "Blocked" },
  { status: "todo", label: "To do" },
];

export function TaskListView() {
  const { data, isLoading } = useTasks();
  const complete = useCompleteTask();
  const update = useUpdateTask();
  const reorder = useReorderTasks();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [blockedDialog, setBlockedDialog] = useState<{ taskId: string; deps: { id: string; title: string }[] } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const tasks = data?.tasks ?? [];
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

  function handleDragEnd(status: TaskStatus, group: Task[]) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = group.findIndex((t) => t.id === active.id);
      const newIndex = group.findIndex((t) => t.id === over.id);
      const reordered = [...group];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      reorder.mutate(reordered.map((t) => t.id));
    };
  }

  const doneCount = tasks.filter((t) => t.status === "done" || t.status === "cancelled").length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <QuickAddBar />

      <BatchActionBar selectedIds={Array.from(selected)} onClear={() => setSelected(new Set())} />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet — try the quick-add bar above.</p>}

      {OPEN_GROUPS.map(({ status, label }) => {
        const group = tasks.filter((t) => t.status === status).sort((a, b) => a.sortOrder - b.sortOrder);
        if (group.length === 0) return null;
        return (
          <div key={status}>
            <h3 className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">
              {label} ({group.length})
            </h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(status, group)}>
              <SortableContext items={group.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="rounded-lg border border-border">
                  {group.map((task) => (
                    <SortableTaskRow
                      key={task.id}
                      task={task}
                      onComplete={() => void handleComplete(task)}
                      onOpen={() => setOpenTaskId(task.id)}
                      selected={selected.has(task.id)}
                      onToggleSelect={() => toggleSelect(task.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );
      })}

      {doneCount > 0 && (
        <div>
          <h3 className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">Done ({doneCount})</h3>
          <div className="rounded-lg border border-border opacity-60">
            <VirtualTaskList
              tasks={tasks.filter((t) => t.status === "done" || t.status === "cancelled")}
              onComplete={(task) => void handleComplete(task)}
              onOpen={(id) => setOpenTaskId(id)}
            />
          </div>
        </div>
      )}

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
