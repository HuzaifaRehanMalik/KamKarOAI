"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
import { requireUser } from "@/lib/session";
import { runWithUserKey } from "@/lib/keys";
import { PROVIDERS, TEST_MODELS } from "@/lib/ai/models";

const addKeySchema = z.object({
  provider: z.enum(PROVIDERS),
  label: z.string().trim().min(1).max(60),
  key: z.string().trim().min(10).max(500),
});

export async function addApiKey(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = addKeySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fill in provider, label and a valid key." };
  const { provider, label, key } = parsed.data;

  await prisma.apiKey.create({
    data: { userId: user.id, provider, label, last4: key.slice(-4), ...encryptSecret(key) },
  });
  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteApiKey(id: string) {
  const user = await requireUser();
  await prisma.apiKey.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/settings");
}

export async function testApiKey(id: string) {
  const user = await requireUser();
  const key = await prisma.apiKey.findFirst({ where: { id, userId: user.id }, select: { provider: true } });
  if (!key) return { ok: false, message: "Key not found" };
  try {
    await runWithUserKey(user.id, { apiKeyId: id, model: TEST_MODELS[key.provider], system: "", prompt: "Reply with OK." });
    return { ok: true, message: "Key works" };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Request failed" };
  }
}

export async function playgroundRun(input: { apiKeyId: string; model: string; system: string; prompt: string }) {
  const user = await requireUser();
  try {
    const res = await runWithUserKey(user.id, input);
    return { ok: true as const, ...res };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Request failed" };
  }
}
