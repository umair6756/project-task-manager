import { useState } from "react";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import { useProjects } from "@/features/projects/useProjects";
import { useCompleteTask, useTasks, useUpdateTask } from "./useTasks";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { priorityColor } from "./priority";
import type { Task, TaskStatus } from "./types";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in-progress", label: "In progress" },
  { status: "blocked", label: "Blocked" },
  { status: "done", label: "Done" },
];

function KanbanCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        "w-full cursor-grab rounded-md border border-border bg-background p-2.5 text-left text-sm shadow-sm",
        isDragging && "opacity-50",
      )}
    >
      <p className="truncate">{task.title}</p>
      {task.priority !== "P4" && (
        <span className={cn("mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium", priorityColor[task.priority])}>{task.priority}</span>
      )}
    </button>
  );
}

function KanbanColumn({ status, label, tasks, onOpen }: { status: TaskStatus; label: string; tasks: Task[]; onOpen: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={cn("flex w-64 shrink-0 flex-col rounded-lg border border-border bg-card/40 p-2", isOver && "ring-1 ring-primary")}>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <KanbanCard key={t.id} task={t} onOpen={() => onOpen(t.id)} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { data: projectsData } = useProjects();
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const { data } = useTasks({ projectId });
  const update = useUpdateTask();
  const complete = useCompleteTask();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const tasks = data?.tasks ?? [];
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;
    if (newStatus === "done") complete.mutate({ id: task.id });
    else update.mutate({ id: task.id, patch: { status: newStatus } });
  }

  return (
    <div className="space-y-3">
      <select
        value={projectId ?? ""}
        onChange={(e) => setProjectId(e.target.value || undefined)}
        className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
      >
        <option value="">All projects</option>
        {(projectsData?.projects ?? []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.status} status={col.status} label={col.label} tasks={tasks.filter((t) => t.status === col.status)} onOpen={setOpenTaskId} />
          ))}
        </div>
      </DndContext>

      {openTask && <TaskDetailPanel task={openTask} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}
