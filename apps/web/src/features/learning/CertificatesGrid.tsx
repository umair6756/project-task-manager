import type React from "react";
import { useState } from "react";
import { format, isPast } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useCertificates, useCreateCertificate, useDeleteCertificate } from "./useCertificates";

export function CertificatesGrid() {
  const { data } = useCertificates();
  const create = useCreateCertificate();
  const del = useDeleteCertificate();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const certificates = data?.certificates ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), issuer: issuer || undefined, expiresAt: expiresAt || undefined, file: file ?? undefined });
    setTitle("");
    setIssuer("");
    setExpiresAt("");
    setFile(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add certificate
      </Button>

      {showForm && (
        <form onSubmit={submit} className="grid grid-cols-2 gap-2 rounded-md border border-border p-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="col-span-2" />
          <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Issuer" />
          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="col-span-2 text-xs" />
          <Button type="submit" size="sm" className="col-span-2" disabled={create.isPending}>
            Save
          </Button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {certificates.map((c) => {
          const expired = c.expiresAt && isPast(new Date(c.expiresAt));
          return (
            <div key={c.id} className="relative rounded-lg border border-border p-3">
              <button onClick={() => del.mutate(c.id)} className="absolute right-2 top-2" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
              <p className="pr-5 text-sm font-medium">{c.title}</p>
              {c.issuer && <p className="text-xs text-muted-foreground">{c.issuer}</p>}
              {c.expiresAt && (
                <span className={cn("mt-1 inline-block rounded px-1.5 py-0.5 text-[10px]", expired ? "bg-destructive/20 text-destructive" : "bg-secondary text-secondary-foreground")}>
                  {expired ? "Expired" : "Expires"} {format(new Date(c.expiresAt), "MMM d, yyyy")}
                </span>
              )}
            </div>
          );
        })}
        {certificates.length === 0 && <p className="text-sm text-muted-foreground">No certificates yet.</p>}
      </div>
    </div>
  );
}
