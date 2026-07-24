import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/features/platform/useApiKeys";

export function ApiKeysManager() {
  const { data } = useApiKeys();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);

  const keys = data?.keys ?? [];

  async function submit() {
    if (!name.trim()) return;
    const res = await create.mutateAsync(name.trim());
    setRawKey(res.rawKey);
    setName("");
  }

  return (
    <div className="max-w-md space-y-3">
      <div className="flex gap-1.5">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g. CLI script)" className="h-8 text-sm" />
        <Button size="sm" onClick={() => void submit()} disabled={!name.trim() || create.isPending}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {rawKey && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary/10 p-2.5 text-xs">
          <code className="truncate">{rawKey}</code>
          <button onClick={() => navigator.clipboard.writeText(rawKey)} title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {rawKey && <p className="text-xs text-muted-foreground">This is shown once — copy it now.</p>}

      <ul className="space-y-1.5">
        {keys.map((k) => (
          <li key={k.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <div>
              <p>{k.name}</p>
              <p className="text-xs text-muted-foreground">{k.revokedAt ? "Revoked" : k.lastUsedAt ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "Never used"}</p>
            </div>
            {!k.revokedAt && (
              <button onClick={() => revoke.mutate(k.id)} aria-label="Revoke">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </li>
        ))}
        {keys.length === 0 && <p className="text-sm text-muted-foreground">No API keys yet.</p>}
      </ul>
    </div>
  );
}
