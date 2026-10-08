"use client";

import { useState, useTransition } from "react";
import { playgroundRun } from "@/app/actions/keys";
import { ModelPicker, type KeyOption } from "@/components/model-picker";
import { FormMessage } from "@/components/form-message";

export function Playground({ keys }: { keys: KeyOption[] }) {
  const [sel, setSel] = useState({ apiKeyId: "", model: "" });
  const [system, setSystem] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{ text?: string; tokens?: number; error?: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="card space-y-4">
      <ModelPicker keys={keys} apiKeyId={sel.apiKeyId} model={sel.model} onChange={setSel} />
      <div>
        <label className="label">System prompt (optional)</label>
        <textarea className="input min-h-16" value={system} onChange={(e) => setSystem(e.target.value)} />
      </div>
      <div>
        <label className="label">Prompt</label>
        <textarea className="input min-h-32" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <button
        className="btn-primary"
        disabled={pending || !sel.apiKeyId || !sel.model || !prompt.trim()}
        onClick={() =>
          start(async () => {
            setResult(null);
            const res = await playgroundRun({ ...sel, system, prompt });
            setResult(res.ok ? { text: res.text, tokens: res.tokens } : { error: res.error });
          })
        }
      >
        {pending ? "Running…" : "Run"}
      </button>
      <FormMessage error={result?.error} />
      {result?.text !== undefined && (
        <div>
          <div className="mb-1 text-sm text-muted">Response · {result.tokens} tokens</div>
          <pre className="whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm">{result.text}</pre>
        </div>
      )}
    </div>
  );
}
