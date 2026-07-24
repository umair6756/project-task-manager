import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskRow } from "./TaskRow";
import type { Task } from "./types";

interface Props {
  task: Task;
  onComplete: () => void;
  onOpen: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}

export function SortableTaskRow({ task, onComplete, onOpen, selected, onToggleSelect }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <TaskRow task={task} onComplete={onComplete} onOpen={onOpen} selected={selected} onToggleSelect={onToggleSelect} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}
