import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateCheckIn } from "./useGoals";
import type { KeyResult } from "./types";

export function CheckInDialog({ goalId, keyResults, onClose }: { goalId: string; keyResults: KeyResult[]; onClose: () => void }) {
  const create = useCreateCheckIn();
  const [keyResultId, setKeyResultId] = useState<string>("");
  const [value, setValue] = useState("");
  const [reflection, setReflection] = useState("");

  async function submit() {
    await create.mutateAsync({
      goalId,
      input: { keyResultId: keyResultId || null, value: value ? Number(value) : null, reflection: reflection || undefined },
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold">Check in</h2>
        <select value={keyResultId} onChange={(e) => setKeyResultId(e.target.value)} className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm">
          <option value="">General reflection (no key result)</option>
          {keyResults.map((kr) => (
            <option key={kr.id} value={kr.id}>
              {kr.title}
            </option>
          ))}
        </select>
        {keyResultId && (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="New value"
            className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
          />
        )}
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Reflection..."
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void submit()} disabled={create.isPending}>
            Save check-in
          </Button>
        </div>
      </div>
    </div>
  );
}
