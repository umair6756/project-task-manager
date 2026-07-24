import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

export function DataExportImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function exportData() {
    const accessToken = useAuthStore.getState().accessToken;
    const res = await fetch("/api/platform/export", { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
    if (!res.ok) {
      toast.error("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowforge-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const accessToken = useAuthStore.getState().accessToken;
      const res = await fetch("/api/platform/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify(parsed),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body?.error?.message ?? "Import failed");
      const counts = Object.entries(body.data.imported as Record<string, number>)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${n} ${k}`)
        .join(", ");
      toast.success(`Imported: ${counts || "nothing new"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed — invalid file");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-sm space-y-3">
      <Button variant="secondary" size="sm" onClick={() => void exportData()}>
        <Download className="mr-1.5 h-3.5 w-3.5" /> Export all data (.json)
      </Button>
      <div>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={importing}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> {importing ? "Importing..." : "Import from .json"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importData(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Import always creates new records with fresh ids — it never overwrites or collides with your existing data.</p>
    </div>
  );
}
