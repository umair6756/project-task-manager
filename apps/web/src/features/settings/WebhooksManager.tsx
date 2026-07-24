import type React from "react";
import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateWebhook, useDeleteWebhook, useWebhooks } from "@/features/platform/useWebhooks";

const EVENT_OPTIONS = ["task.completed", "habit.done", "goal.checkedIn"];

export function WebhooksManager() {
  const { data } = useWebhooks();
  const create = useCreateWebhook();
  const del = useDeleteWebhook();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<Set<string>>(new Set());
  const [secret, setSecret] = useState<string | null>(null);

  const webhooks = data?.webhooks ?? [];

  function toggleEvent(e: string) {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e);
      else next.add(e);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || events.size === 0) return;
    const res = await create.mutateAsync({ url: url.trim(), events: Array.from(events) });
    setSecret(res.webhook.secret);
    setUrl("");
    setEvents(new Set());
  }

  return (
    <div className="max-w-md space-y-3">
      <form onSubmit={submit} className="space-y-2 rounded-md border border-border p-3">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhook" />
        <div className="flex flex-wrap gap-1.5">
          {EVENT_OPTIONS.map((ev) => (
            <button
              key={ev}
              type="button"
              onClick={() => toggleEvent(ev)}
              className={`rounded-full border px-2.5 py-1 text-xs ${events.has(ev) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {ev}
            </button>
          ))}
        </div>
        <Button type="submit" size="sm" disabled={!url.trim() || events.size === 0}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add webhook
        </Button>
      </form>

      {secret && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 p-2.5 text-xs">
          <code className="truncate">{secret}</code>
          <button onClick={() => navigator.clipboard.writeText(secret)} title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <ul className="space-y-1.5">
        {webhooks.map((w) => (
          <li key={w.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate">{w.url}</p>
              <p className="text-xs text-muted-foreground">{w.events.join(", ")}</p>
            </div>
            <button onClick={() => del.mutate(w.id)} aria-label="Delete webhook">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </li>
        ))}
        {webhooks.length === 0 && <p className="text-sm text-muted-foreground">No webhooks yet.</p>}
      </ul>
    </div>
  );
}
