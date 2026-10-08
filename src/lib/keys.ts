import "server-only";
import { prisma } from "./db";
import { decryptSecret } from "./crypto";
import { runPrompt } from "./ai/providers";

/** Decrypts a key owned by userId. The plaintext only lives in memory for this request. */
export async function loadUserKey(userId: string, apiKeyId: string) {
  const key = await prisma.apiKey.findFirst({ where: { id: apiKeyId, userId } });
  if (!key) throw new Error("API key not found — re-select it in the node settings");
  return { provider: key.provider, secret: decryptSecret(key) };
}

export async function runWithUserKey(
  userId: string,
  args: { apiKeyId: string; model: string; system: string; prompt: string },
) {
  const { provider, secret } = await loadUserKey(userId, args.apiKeyId);
  return runPrompt({ provider, modelId: args.model, apiKey: secret, system: args.system, prompt: args.prompt });
}
