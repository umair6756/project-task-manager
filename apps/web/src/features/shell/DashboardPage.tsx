import { useState } from "react";
import type { ReactNode } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Eye, EyeOff, Flame, GripVertical, Pencil, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { useTodayView } from "@/features/tasks/useViews";
import { useGamificationMe } from "@/features/gamification/useGamification";
import { useHabits } from "@/features/habits/useHabits";
import { MitPicker } from "@/features/planning/MitPicker";
import { ShutdownFlow } from "@/features/planning/ShutdownFlow";
import { HabitsTodayStrip } from "@/features/habits/HabitsTodayStrip";
import { GoalsGlance } from "@/features/goals/GoalsGlance";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardLayout, type WidgetId } from "./useDashboardLayout";

function TodayWidget() {
  const { data, isLoading } = useTodayView();
  const tasks = data ? [...data.overdue, ...data.dueToday, ...data.startingToday] : [];
  if (isLoading)
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  return (
    <ul className="space-y-1.5 text-sm">
      {tasks.length === 0 && <li className="text-muted-foreground">Nothing due today. Enjoy it.</li>}
      {tasks.map((t) => (
        <li key={t.id} className="truncate">
          {t.title}
        </li>
      ))}
    </ul>
  );
}

function LevelWidget() {
  const { data } = useGamificationMe();
  if (!data) return null;
  return (
    <div className="space-y-1 text-sm">
      <p className="text-2xl font-semibold">Lv {data.levelInfo.level}</p>
      <p className="text-muted-foreground">
        {data.levelInfo.xpIntoLevel} / {data.levelInfo.xpForNextLevel} XP
      </p>
      <p className="text-muted-foreground">{data.freezeTokensAvailable} streak-freeze tokens</p>
    </div>
  );
}

const WIDGETS: Record<WidgetId, { title: string; render: () => ReactNode }> = {
  mits: { title: "MITs", render: () => <MitPicker /> },
  today: { title: "Today", render: () => <TodayWidget /> },
  habits: { title: "Habits", render: () => <HabitsTodayStrip /> },
  goals: { title: "Goals", render: () => <GoalsGlance /> },
  level: { title: "Level & XP", render: () => <LevelWidget /> },
};

function WidgetCard({ id, editMode, hidden, onToggleHidden }: { id: WidgetId; editMode: boolean; hidden: boolean; onToggleHidden: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !editMode });
  const widget = WIDGETS[id];

  if (hidden && !editMode) return null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : hidden ? 0.4 : 1 }}
      className="glass-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{widget.title}</h2>
        {editMode && (
          <div className="flex items-center gap-1">
            <button onClick={onToggleHidden} aria-label="Toggle visibility">
              {hidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            <button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag to reorder">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
      {!hidden && widget.render()}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatTile({ icon: Icon, label, value, gradient }: { icon: typeof Flame; label: string; value: string | number; gradient: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn("glass-card flex items-center gap-3 p-3", "shadow-sm")}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", gradient)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

function DashboardHeader() {
  const user = useAuthStore((s) => s.user);
  const { data: gam } = useGamificationMe();
  const { data: today } = useTodayView();
  const { data: habitsData } = useHabits();

  const todayCount = today ? today.overdue.length + today.dueToday.length + today.startingToday.length : 0;
  const bestStreak = Math.max(0, ...(habitsData?.habits.map((h) => h.currentStreak) ?? [0]));

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}
          {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Sparkles} label="Due today" value={todayCount} gradient="from-blue-500 to-cyan-400" />
        <StatTile icon={Trophy} label={`Level ${gam?.levelInfo.level ?? 1}`} value={`${gam?.levelInfo.xpIntoLevel ?? 0} XP`} gradient="from-primary to-fuchsia-500" />
        <StatTile icon={Flame} label="Best habit streak" value={`${bestStreak}d`} gradient="from-orange-500 to-amber-400" />
        <StatTile icon={Trophy} label="Freeze tokens" value={gam?.freezeTokensAvailable ?? 0} gradient="from-emerald-500 to-teal-400" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { order, hidden, reorder, toggleHidden } = useDashboardLayout();
  const [editMode, setEditMode] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as WidgetId);
    const newIndex = order.indexOf(over.id as WidgetId);
    const next = [...order];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    reorder(next);
  }

  return (
    <div className="space-y-5">
      <DashboardHeader />

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowShutdown(true)}>
          Shutdown ritual
        </Button>
        <Button variant={editMode ? "gradient" : "ghost"} size="sm" onClick={() => setEditMode((v) => !v)}>
          <Pencil className="mr-1 h-3.5 w-3.5" /> {editMode ? "Done" : "Edit layout"}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <motion.div
            className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3")}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {order.map((id) => (
              <motion.div key={id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                <WidgetCard id={id} editMode={editMode} hidden={hidden.includes(id)} onToggleHidden={() => toggleHidden(id)} />
              </motion.div>
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>

      {showShutdown && <ShutdownFlow onClose={() => setShowShutdown(false)} />}
    </div>
  );
}
