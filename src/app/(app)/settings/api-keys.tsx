"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addApiKey, deleteApiKey, testApiKey } from "@/app/actions/keys";
import { PROVIDERS, PROVIDER_LABELS, type Provider } from "@/lib/ai/models";
import { FormMessage } from "@/components/form-message";

export function AddKeyForm() {
  const [state, action, pending] = useActionState(addApiKey, null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-[160px_1fr_2fr_auto] sm:items-end">
      <div>
        <label className="label" htmlFor="provider">Provider</label>
        <select className="input" id="provider" name="provider" required>
          {PROVIDERS.map((p) => <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="label">Label</label>
        <input className="input" id="label" name="label" placeholder="Personal" required maxLength={60} />
      </div>
      <div>
        <label className="label" htmlFor="key">API key</label>
        <input className="input" id="key" name="key" type="password" placeholder="sk-…" required autoComplete="off" />
      </div>
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Add key"}</button>
      <div className="sm:col-span-4">
        <FormMessage error={state?.error} success={state?.ok ? "Key saved." : null} />
      </div>
    </form>
  );
}

export function KeyRow({ apiKey }: { apiKey: { id: string; provider: Provider; label: string; last4: string } }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{PROVIDER_LABELS[apiKey.provider]}</span>
      <span className="font-medium">{apiKey.label}</span>
      <span className="font-mono text-sm text-muted">••••{apiKey.last4}</span>
      {result && <span className={`text-sm ${result.ok ? "text-success" : "text-danger"}`}>{result.message}</span>}
      <div className="ml-auto flex gap-2">
        <button className="btn-outline py-1" disabled={pending} onClick={() => start(async () => setResult(await testApiKey(apiKey.id)))}>
          {pending ? "Testing…" : "Test"}
        </button>
        <button
          className="btn-danger py-1"
          disabled={pending}
          onClick={() => confirm(`Delete key "${apiKey.label}"?`) && start(() => deleteApiKey(apiKey.id))}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
