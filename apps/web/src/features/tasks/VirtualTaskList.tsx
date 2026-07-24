import type React from "react";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TaskRow } from "./TaskRow";
import type { Task } from "./types";

const ROW_HEIGHT = 42;
const VIRTUALIZE_THRESHOLD = 40;

interface Props {
  tasks: Task[];
  onComplete: (task: Task) => void;
  onOpen: (id: string) => void;
}

// Plain lists render fine up to a few dozen rows; beyond that (a big Done
// section, a large saved-filter result) we virtualize so scroll stays
// smooth regardless of how many tasks the user has accumulated.
export function VirtualTaskList({ tasks, onComplete, onOpen }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  if (tasks.length <= VIRTUALIZE_THRESHOLD) {
    return (
      <div>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onComplete={() => onComplete(task)} onOpen={() => onOpen(task.id)} />
        ))}
      </div>
    );
  }

  return <VirtualizedInner tasks={tasks} onComplete={onComplete} onOpen={onOpen} parentRef={parentRef} />;
}

function VirtualizedInner({ tasks, onComplete, onOpen, parentRef }: Props & { parentRef: React.RefObject<HTMLDivElement> }) {
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="max-h-96 overflow-y-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((row) => {
          const task = tasks[row.index]!;
          return (
            <div key={task.id} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: row.size, transform: `translateY(${row.start}px)` }}>
              <TaskRow task={task} onComplete={() => onComplete(task)} onOpen={() => onOpen(task.id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
