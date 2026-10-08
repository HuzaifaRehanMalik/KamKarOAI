"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { FormMessage } from "@/components/form-message";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(params.get("error") ? "This reset link is invalid or has expired." : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return setError("Missing reset token. Use the link from your email.");
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword !== form.get("confirm")) return setError("Passwords do not match");
    setLoading(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword, token });
    setLoading(false);
    if (error) return setError(error.message ?? "Reset failed");
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold">Set a new password</h1>
      <FormMessage error={error} />
      <div>
        <label className="label" htmlFor="password">New password</label>
        <input className="input" id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Confirm password</label>
        <input className="input" id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Saving…" : "Reset password"}</button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">Request a new link</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
