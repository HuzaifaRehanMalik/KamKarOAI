"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/[0.04] px-5 py-3.5 text-sm">
      <span>Please verify your email address ({email}).</span>
      <button
        className="font-medium text-primary hover:underline disabled:opacity-50"
        disabled={state === "sending" || state === "sent"}
        onClick={async () => {
          setState("sending");
          const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/dashboard" });
          setState(error ? "error" : "sent");
        }}
      >
        {state === "sent" ? "Email sent. Check your inbox" : state === "error" ? "Failed, try again" : "Resend verification email"}
      </button>
    </div>
  );
}
