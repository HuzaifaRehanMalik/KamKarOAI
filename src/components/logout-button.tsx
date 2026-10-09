"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="font-mono text-xs uppercase tracking-[0.12em] text-muted transition hover:text-foreground"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
