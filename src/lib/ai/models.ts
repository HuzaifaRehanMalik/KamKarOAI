// Shared between client and server. Users can also type any model id the
// provider supports; these are just suggestions for the dropdown.
export const PROVIDERS = ["openai", "anthropic", "google"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Gemini",
};

export const SUGGESTED_MODELS: Record<Provider, string[]> = {
  openai: ["gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini", "o4-mini"],
  anthropic: ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
};

// Cheapest model per provider, used by the "Test key" button.
export const TEST_MODELS: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-5-5",
  google: "gemini-2.5-flash-lite",
};
