"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 15_000;

// Re-fetches the server-rendered admin data on an interval so the panel stays current.
export function LiveRefresh() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      start(() => router.refresh());
      setUpdatedAt(new Date());
    };
    const timer = setInterval(refresh, INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full bg-success ${pending ? "animate-pulse" : ""}`} />
        Live · updated {updatedAt.toLocaleTimeString()}
      </span>
      <button
        className="btn-outline px-2 py-1 text-xs"
        disabled={pending}
        onClick={() => {
          start(() => router.refresh());
          setUpdatedAt(new Date());
        }}
      >
        Refresh
      </button>
    </div>
  );
}
