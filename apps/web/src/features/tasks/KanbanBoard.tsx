import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useProjects } from "@/features/projects/useProjects";
import { useCompleteTask, useCreateTask, useTasks, useUpdateTask } from "./useTasks";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { LabelChips } from "./LabelChips";
import { SubtaskProgress } from "./SubtaskProgress";
import { priorityBar, priorityColor } from "./priority";
import type { Task, TaskStatus } from "./types";

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "todo", label: "To do", accent: "bg-zinc-400" },
  { status: "in-progress", label: "In progress", accent: "bg-blue-500" },
  { status: "blocked", label: "Blocked", accent: "bg-red-500" },
  { status: "done", label: "Done", accent: "bg-emerald-500" },
];

function CardBody({ task }: { task: Task }) {
  return (
    <>
      <span className={cn("absolute inset-y-0 left-0 w-[3px] rounded-l-md", priorityBar[task.priority])} />
      <p className="truncate pr-1 text-sm font-medium">{task.title}</p>
      {(task.labels.length > 0 || task.subtasks.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <LabelChips labelIds={task.labels} />
          <SubtaskProgress subtasks={task.subtasks} />
        </div>
      )}
      {task.priority !== "P4" && (
        <span className={cn("mt-2 inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium", priorityColor[task.priority])}>{task.priority}</span>
      )}
    </>
  );
}

function KanbanCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <motion.button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      layoutId={task.id}
      onClick={onOpen}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: isDragging ? 0.3 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2, boxShadow: "0 8px 20px -8px rgb(0 0 0 / 0.35)" }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="relative w-full cursor-grab overflow-hidden rounded-md border border-border bg-background py-2 pl-3 pr-2 text-left shadow-sm active:cursor-grabbing"
    >
      <CardBody task={task} />
    </motion.button>
  );
}

function KanbanColumn({
  status,
  label,
  accent,
  tasks,
  onOpen,
  onQuickAdd,
}: {
  status: TaskStatus;
  label: string;
  accent: string;
  tasks: Task[];
  onOpen: (id: string) => void;
  onQuickAdd: (title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  function submit() {
    if (title.trim()) onQuickAdd(title.trim());
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col rounded-lg border border-border bg-card/40 p-2 transition-colors",
        isOver && "border-primary/50 bg-primary/5 ring-1 ring-primary/40",
      )}
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("h-2 w-2 rounded-full", accent)} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="ml-auto rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">{tasks.length}</span>
      </div>

      <div className="flex min-h-[4px] flex-col gap-2">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <KanbanCard key={t.id} task={t} onOpen={() => onOpen(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {adding ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") {
              setTitle("");
              setAdding(false);
            }
          }}
          placeholder="Task title..."
          className="mt-2 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      )}
    </div>
  );
}

export function KanbanBoard() {
  const { data: projectsData } = useProjects();
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const { data } = useTasks({ projectId });
  const update = useUpdateTask();
  const complete = useCompleteTask();
  const create = useCreateTask();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const tasks = data?.tasks ?? [];
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;
  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
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

      <LayoutGroup>
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                accent={col.accent}
                tasks={tasks.filter((t) => t.status === col.status)}
                onOpen={setOpenTaskId}
                onQuickAdd={(title) => create.mutate({ title, status: col.status, projectId })}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <motion.div
                initial={{ scale: 1.05, rotate: -2 }}
                animate={{ scale: 1.05, rotate: -2 }}
                className="relative w-72 overflow-hidden rounded-md border border-primary/50 bg-background py-2 pl-3 pr-2 shadow-2xl"
              >
                <CardBody task={activeTask} />
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      </LayoutGroup>

      {openTask && <TaskDetailPanel task={openTask} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}
