import type React from "react";
import { useRef, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuickAddTask } from "./useTasks";
import { useShortcut } from "@/features/shortcuts/useShortcut";

// Free-text quick capture ("pay bill tomorrow 5pm p1 #home") parsed
// server-side by quickAddParser.ts. Global 'q' shortcut focuses it from
// anywhere in the app.
export function QuickAddBar() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const quickAdd = useQuickAddTask();

  useShortcut({ id: "quick-add-focus", keys: "q", description: "Quick-add a task", handler: () => inputRef.current?.focus() });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await quickAdd.mutateAsync(text.trim());
    setText("");
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Quick add: "pay bill tomorrow 5pm p1 #home"  (press q)'
        className="pr-8"
      />
      <CornerDownLeft className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </form>
  );
}
