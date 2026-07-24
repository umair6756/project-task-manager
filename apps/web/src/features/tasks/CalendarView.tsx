import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg } from "@fullcalendar/core";
import { useTasks, useUpdateTask } from "./useTasks";
import { TaskDetailPanel } from "./TaskDetailPanel";

// Tasks with a dueAt render as events; dragging one to a new day/time
// PATCHes dueAt (proposal: "click to time-block" lands with startAt
// support in a later pass — this covers reschedule-by-drag for now).
export function CalendarView() {
  const { data } = useTasks();
  const update = useUpdateTask();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const tasks = data?.tasks ?? [];
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  const events = tasks
    .filter((t) => t.dueAt)
    .map((t) => ({ id: t.id, title: t.title, start: t.dueAt as string, allDay: false, classNames: t.status === "done" ? ["opacity-50", "line-through"] : [] }));

  function onEventDrop(info: EventDropArg) {
    update.mutate({ id: info.event.id, patch: { dueAt: info.event.start?.toISOString() ?? null } });
  }

  return (
    <div className="calendar-dark rounded-lg border border-border p-2">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
        editable
        events={events}
        eventDrop={onEventDrop}
        eventClick={(info) => setOpenTaskId(info.event.id)}
        height="auto"
      />
      {openTask && <TaskDetailPanel task={openTask} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}
