"use client";

import { PROVIDER_LABELS, SUGGESTED_MODELS, type Provider } from "@/lib/ai/models";

export type KeyOption = { id: string; provider: Provider; label: string };

/** API key dropdown + model combobox (suggestions, but any model id can be typed). */
export function ModelPicker({
  keys,
  apiKeyId,
  model,
  onChange,
}: {
  keys: KeyOption[];
  apiKeyId: string;
  model: string;
  onChange: (v: { apiKeyId: string; model: string }) => void;
}) {
  const provider = keys.find((k) => k.id === apiKeyId)?.provider;
  const listId = `models-${provider ?? "none"}`;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">API key</label>
        <select
          className="input"
          value={apiKeyId}
          onChange={(e) => {
            const p = keys.find((k) => k.id === e.target.value)?.provider;
            onChange({ apiKeyId: e.target.value, model: p ? SUGGESTED_MODELS[p][0] : "" });
          }}
        >
          <option value="">Select a key…</option>
          {keys.map((k) => (
            <option key={k.id} value={k.id}>{PROVIDER_LABELS[k.provider]}: {k.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Model</label>
        <input
          className="input"
          list={listId}
          value={model}
          placeholder={provider ? "Pick or type a model id" : "Select a key first"}
          disabled={!provider}
          onChange={(e) => onChange({ apiKeyId, model: e.target.value })}
        />
        {provider && (
          <datalist id={listId}>
            {SUGGESTED_MODELS[provider].map((m) => <option key={m} value={m} />)}
          </datalist>
        )}
      </div>
    </div>
  );
}
