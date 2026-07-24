import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/apiClient";
import { useCreateManualEntry } from "./useTimeEntries";

export function ManualEntryDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateManualEntry();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!start || !end) return;
    try {
      await create.mutateAsync({ start: new Date(start).toISOString(), end: new Date(end).toISOString(), note: note || undefined });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? "Overlaps an existing time entry." : "Failed to save entry.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold">Manual time entry</h2>
        <div className="space-y-1.5">
          <Label>Start</Label>
          <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>End</Label>
          <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={create.isPending}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
