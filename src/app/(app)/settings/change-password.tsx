"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { FormMessage } from "@/components/form-message";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newPassword = String(form.get("newPassword"));
    setError(null);
    setSuccess(null);
    if (newPassword !== form.get("confirm")) return setError("New passwords do not match");
    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("currentPassword")),
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (error) return setError(error.message ?? "Could not change password");
    formEl.reset();
    setSuccess("Password changed. Other devices have been signed out.");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-3">
      <FormMessage error={error} success={success} />
      <div>
        <label className="label" htmlFor="currentPassword">Current password</label>
        <input className="input" id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div>
        <label className="label" htmlFor="newPassword">New password</label>
        <input className="input" id="newPassword" name="newPassword" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Confirm new password</label>
        <input className="input" id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      <button className="btn-primary" disabled={loading}>{loading ? "Saving…" : "Change password"}</button>
    </form>
  );
}
