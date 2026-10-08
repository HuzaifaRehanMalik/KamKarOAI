"use client";

import { useTransition } from "react";
import { deleteUser, setUserDisabled } from "@/app/actions/admin";

export function UserActions({ id, email, disabled }: { id: string; email: string; disabled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex justify-end gap-2">
      <button className="btn-outline py-1 text-xs" disabled={pending} onClick={() => start(() => setUserDisabled(id, !disabled))}>
        {disabled ? "Enable" : "Disable"}
      </button>
      <button
        className="btn-danger py-1 text-xs"
        disabled={pending}
        onClick={() => confirm(`Permanently delete ${email} and all their data?`) && start(() => deleteUser(id))}
      >
        Delete
      </button>
    </div>
  );
}
