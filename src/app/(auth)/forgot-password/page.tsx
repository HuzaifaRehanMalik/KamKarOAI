"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { FormMessage } from "@/components/form-message";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) return setError(error.message ?? "Something went wrong");
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="mb-2 font-display text-3xl font-semibold tracking-[-0.02em]">Forgot password</h1>
      <p className="text-sm text-muted">Enter your email and we&apos;ll send you a reset link.</p>
      <FormMessage error={error} success={sent ? "If an account exists for that email, a reset link is on its way." : null} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">Back to login</Link>
      </p>
    </form>
  );
}
