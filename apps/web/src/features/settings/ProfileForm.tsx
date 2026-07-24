import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfile, useUploadAvatar } from "./useProfile";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [name, setName] = useState(user?.name ?? "");
  const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");
  const [weekStartDay, setWeekStartDay] = useState(user?.weekStartDay ?? 0);
  const [dayEndHour, setDayEndHour] = useState(user?.dayEndHour ?? 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({ name, timezone, weekStartDay, dayEndHour });
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <div className="flex items-center gap-3">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm">{user?.name?.[0]?.toUpperCase()}</div>
        )}
        <label className="cursor-pointer text-xs text-primary hover:underline">
          Change avatar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar.mutate(file);
            }}
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Timezone (IANA)</Label>
        <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. America/New_York" />
      </div>

      <div className="space-y-1.5">
        <Label>Week starts on</Label>
        <select value={weekStartDay} onChange={(e) => setWeekStartDay(Number(e.target.value))} className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm">
          {WEEKDAYS.map((d, i) => (
            <option key={i} value={i}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Day-end hour (0-6, when "today" rolls over)</Label>
        <Input type="number" min={0} max={6} value={dayEndHour} onChange={(e) => setDayEndHour(Number(e.target.value))} />
      </div>

      <Button type="submit" size="sm" disabled={update.isPending}>
        Save profile
      </Button>
    </form>
  );
}
