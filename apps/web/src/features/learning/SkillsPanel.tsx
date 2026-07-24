import type React from "react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkillsRadar } from "./SkillsRadar";
import { useCreateSkill, useDeleteSkill, useSkills, useUpdateSkill } from "./useSkills";

export function SkillsPanel() {
  const { data } = useSkills();
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const del = useDeleteSkill();
  const [name, setName] = useState("");

  const skills = data?.skills ?? [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), level: 1 });
    setName("");
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <SkillsRadar />
      <div className="space-y-2">
        <form onSubmit={add} className="flex gap-1.5">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New skill" className="h-8 text-sm" />
          <Button type="submit" size="sm" disabled={!name.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </form>
        <ul className="space-y-1.5">
          {skills.map((s) => (
            <li key={s.id} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm">
              <span className="flex-1 truncate">{s.name}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={s.level}
                onChange={(e) => update.mutate({ id: s.id, patch: { level: Number(e.target.value) } })}
                className="w-20"
              />
              <span className="w-4 text-xs text-muted-foreground">{s.level}</span>
              <button onClick={() => del.mutate(s.id)} aria-label="Delete skill">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
