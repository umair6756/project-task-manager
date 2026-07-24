import type React from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "./useAuth";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await forgot.mutateAsync(email);
    setSent(true);
    toast.success("If that email exists, a reset link was sent.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-8">
        <div>
          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">We'll email you a reset link.</p>
        </div>
        {sent ? (
          <p className="text-sm text-muted-foreground">Check your email for a reset link.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              {forgot.isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
        <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
