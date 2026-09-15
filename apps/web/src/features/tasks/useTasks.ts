import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/apiClient";
import type { Task, TaskStatus, DependencyWarning } from "./types";

const tasksKey = ["tasks"] as const;

export function useTasks(params: { status?: TaskStatus[]; projectId?: string } = {}) {
  const query = new URLSearchParams();
  if (params.status) for (const s of params.status) query.append("status", s);
  if (params.projectId) query.set("projectId", params.projectId);
  const qs = query.toString();

  return useQuery({
    queryKey: [...tasksKey, params],
    queryFn: () => api.get<{ tasks: Task[] }>(`/tasks${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; projectId?: string | null; priority?: Task["priority"]; dueAt?: string | null; status?: TaskStatus }) =>
      api.post<{ task: Task }>("/tasks", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: tasksKey }),
  });
}

export function useQuickAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.post<{ task: Task }>("/tasks/quick-add", { text }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: tasksKey });
      toast.success(`Added "${res.task.title}"`);
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) => api.patch<{ task: Task }>(`/tasks/${id}`, patch),
    // Optimistic update so inline edits (title, priority, due date) feel instant.
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: tasksKey });
      const previous = qc.getQueriesData<{ tasks: Task[] }>({ queryKey: tasksKey });
      qc.setQueriesData<{ tasks: Task[] } | undefined>({ queryKey: tasksKey }, (old) =>
        old ? { tasks: old.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error("Update failed");
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: tasksKey }),
  });
}

export function useBatchUpdateTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      ids: string[];
      set: { status?: TaskStatus; priority?: Task["priority"]; projectId?: string | null; dueAt?: string | null; addLabels?: string[]; removeLabels?: string[] };
    }) => api.post<{ matched: number; modified: number }>("/tasks/batch", input),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: tasksKey });
      toast.success(`Updated ${res.modified} task${res.modified === 1 ? "" : "s"}`);
    },
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.post<{ reordered: boolean }>("/tasks/reorder", { orderedIds }),
    onMutate: async (orderedIds) => {
      await qc.cancelQueries({ queryKey: tasksKey });
      const previous = qc.getQueriesData<{ tasks: Task[] }>({ queryKey: tasksKey });
      qc.setQueriesData<{ tasks: Task[] } | undefined>({ queryKey: tasksKey }, (old) => {
        if (!old) return old;
        const byId = new Map(old.tasks.map((t) => [t.id, t]));
        const reordered = orderedIds.map((id) => byId.get(id)).filter((t): t is Task => !!t);
        const rest = old.tasks.filter((t) => !orderedIds.includes(t.id));
        return { tasks: [...reordered, ...rest] };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => context?.previous.forEach(([key, data]) => qc.setQueryData(key, data)),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/tasks/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: tasksKey }),
  });
}

// Completing is optimistic + undoable: flips status locally right away, and
// if the server reports the task is blocked by unfinished dependencies we
// roll the optimistic change back and surface a confirm-override toast.
export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, override }: { id: string; override?: boolean }) =>
      api.post<{ task?: Task } & Partial<DependencyWarning>>(`/tasks/${id}/complete`, { overrideDependencyWarning: override }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: tasksKey });
      const previous = qc.getQueriesData<{ tasks: Task[] }>({ queryKey: tasksKey });
      qc.setQueriesData<{ tasks: Task[] } | undefined>({ queryKey: tasksKey }, (old) =>
        old ? { tasks: old.tasks.map((t) => (t.id === id ? { ...t, status: "done" } : t)) } : old,
      );
      return { previous };
    },
    onSuccess: (res, { id }, context) => {
      if (res.warning === "BLOCKED_BY_INCOMPLETE_DEPENDENCIES") {
        // Server refused — roll the optimistic "done" back and let the
        // caller decide whether to retry with overrideDependencyWarning.
        context?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
        return;
      }
      toast("Task completed", {
        action: { label: "Undo", onClick: () => void api.patch(`/tasks/${id}`, { status: "todo" }).then(() => qc.invalidateQueries({ queryKey: tasksKey })) },
      });
    },
    onError: (err, _vars, context) => {
      context?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      if (!(err instanceof ApiError)) toast.error("Failed to complete task");
    },
  });
}
