import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SkipDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-xs space-y-3 rounded-lg border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold">Skip today</h2>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" autoFocus />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onConfirm(reason)}>
            Skip (streak preserved)
          </Button>
        </div>
      </div>
    </div>
  );
}
