import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { Provider } from "./models";

export function getModel(provider: Provider, modelId: string, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
  }
}

export async function runPrompt(opts: {
  provider: Provider;
  modelId: string;
  apiKey: string;
  prompt: string;
  system?: string;
}) {
  const result = await generateText({
    model: getModel(opts.provider, opts.modelId, opts.apiKey),
    system: opts.system || undefined,
    prompt: opts.prompt,
  });
  return { text: result.text, tokens: result.usage.totalTokens ?? 0 };
}
