"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { FormMessage } from "@/components/form-message";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) return setError(error.message ?? "Login failed");
    // Only allow same-site relative redirects.
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="mb-2 font-display text-3xl font-semibold tracking-[-0.02em]">Log in</h1>
      <FormMessage error={error} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">Password</label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
        </div>
        <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
      <p className="text-center text-sm text-muted">
        No account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
