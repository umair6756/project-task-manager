import type React from "react";
import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "./useAuth";
import { ApiError } from "@/lib/apiClient";

export function ResetPasswordPage() {
  const search = useSearch({ from: "/reset-password" }) as { token?: string };
  const [password, setPassword] = useState("");
  const reset = useResetPassword();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!search.token) return toast.error("Missing reset token");
    try {
      await reset.mutateAsync({ token: search.token, password });
      toast.success("Password reset — sign in with your new password.");
      void navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reset failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-8">
        <div>
          <h1 className="text-xl font-semibold">Choose a new password</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </div>
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
        <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
