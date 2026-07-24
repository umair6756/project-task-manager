import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateGoal } from "./useGoals";
import type { GoalHorizon } from "./types";

export function CreateGoalForm({ onDone }: { onDone: () => void }) {
  const create = useCreateGoal();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [horizon, setHorizon] = useState<GoalHorizon>("quarter");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), theme: theme || undefined, horizon });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <select value={horizon} onChange={(e) => setHorizon(e.target.value as GoalHorizon)} className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm">
          <option value="year">Year</option>
          <option value="quarter">Quarter</option>
          <option value="month">Month</option>
        </select>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" className="flex-1" autoFocus />
      </div>
      <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Theme (optional, e.g. 'Year of Health')" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          Create goal
        </Button>
      </div>
    </form>
  );
}
