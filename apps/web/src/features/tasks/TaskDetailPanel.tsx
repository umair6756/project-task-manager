import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteTask, useUpdateTask } from "./useTasks";
import { ChecklistEditor } from "./ChecklistEditor";
import { DependencyPicker } from "./DependencyPicker";
import type { ChecklistItem, Subtask, Task, TaskPriority, TaskStatus } from "./types";

const statuses: TaskStatus[] = ["todo", "in-progress", "blocked", "done", "cancelled"];
const priorities: TaskPriority[] = ["P1", "P2", "P3", "P4"];

export function TaskDetailPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const update = useUpdateTask();
  const del = useDeleteTask();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
  }, [task.id, task.title, task.description]);

  function commitTitle() {
    if (title.trim() && title !== task.title) update.mutate({ id: task.id, patch: { title: title.trim() } });
  }

  function commitDescription() {
    if (description !== (task.description ?? "")) update.mutate({ id: task.id, patch: { description } });
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-medium uppercase text-muted-foreground">Task</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => del.mutate(task.id, { onSuccess: onClose })} title="Delete task">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          className="border-none px-0 text-lg font-medium shadow-none focus-visible:ring-0"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={commitDescription}
          placeholder="Add a description..."
          rows={4}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select
              value={task.status}
              onChange={(e) => update.mutate({ id: task.id, patch: { status: e.target.value as TaskStatus } })}
              className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <select
              value={task.priority}
              onChange={(e) => update.mutate({ id: task.id, patch: { priority: e.target.value as TaskPriority } })}
              className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Due</Label>
            <Input
              type="date"
              value={task.dueAt ? task.dueAt.slice(0, 10) : ""}
              onChange={(e) => update.mutate({ id: task.id, patch: { dueAt: e.target.value ? new Date(e.target.value).toISOString() : null } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Estimate (min)</Label>
            <Input
              type="number"
              min={0}
              value={task.estimateMin ?? ""}
              onChange={(e) => update.mutate({ id: task.id, patch: { estimateMin: e.target.value ? Number(e.target.value) : null } })}
            />
          </div>
        </div>

        <ChecklistEditor
          label="Subtasks"
          items={task.subtasks}
          labelKey="title"
          onChange={(next) => update.mutate({ id: task.id, patch: { subtasks: next as Subtask[] } })}
        />

        <ChecklistEditor
          label="Checklist"
          items={task.checklist}
          labelKey="text"
          onChange={(next) => update.mutate({ id: task.id, patch: { checklist: next as ChecklistItem[] } })}
        />

        <DependencyPicker task={task} />

        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((l) => (
              <span key={l} className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {l}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
