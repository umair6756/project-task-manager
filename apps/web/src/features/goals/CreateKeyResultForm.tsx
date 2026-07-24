import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/features/projects/useProjects";
import { useHabits } from "@/features/habits/useHabits";
import { useCreateKeyResult } from "./useGoals";
import type { BindingKind, KeyResultType } from "./types";

export function CreateKeyResultForm({ goalId, onDone }: { goalId: string; onDone: () => void }) {
  const create = useCreateKeyResult();
  const { data: projects } = useProjects();
  const { data: habitsData } = useHabits();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KeyResultType>("number");
  const [targetValue, setTargetValue] = useState(100);
  const [bindingKind, setBindingKind] = useState<BindingKind | "">("");
  const [refId, setRefId] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({
      goalId,
      input: {
        title: title.trim(),
        type,
        targetValue,
        binding: bindingKind && refId ? { kind: bindingKind, refId } : null,
      },
    });
    onDone();
  }

  const refOptions = bindingKind === "tasksCompletedInProject" ? (projects?.projects ?? []) : bindingKind === "habitCompletionRate" ? (habitsData?.habits ?? []) : [];

  return (
    <form onSubmit={submit} className="space-y-2 rounded-md border border-border p-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Key result title" autoFocus />
      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as KeyResultType)} className="rounded-md border border-input bg-transparent px-2 py-1 text-xs">
          <option value="number">Number</option>
          <option value="percent">Percent</option>
          <option value="boolean">Boolean</option>
        </select>
        {type !== "boolean" && (
          <Input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} placeholder="Target" className="w-24" />
        )}
      </div>
      <div className="flex gap-2">
        <select
          value={bindingKind}
          onChange={(e) => {
            setBindingKind(e.target.value as BindingKind | "");
            setRefId("");
          }}
          className="rounded-md border border-input bg-transparent px-2 py-1 text-xs"
        >
          <option value="">Manual (no auto-binding)</option>
          <option value="tasksCompletedInProject">Auto: tasks completed in project</option>
          <option value="habitCompletionRate">Auto: habit completion rate</option>
          <option value="learningHours">Auto: learning hours</option>
        </select>
        {bindingKind === "tasksCompletedInProject" || bindingKind === "habitCompletionRate" ? (
          <select value={refId} onChange={(e) => setRefId(e.target.value)} className="rounded-md border border-input bg-transparent px-2 py-1 text-xs">
            <option value="">Select...</option>
            {refOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {"name" in o ? o.name : ""}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          Add
        </Button>
      </div>
    </form>
  );
}
